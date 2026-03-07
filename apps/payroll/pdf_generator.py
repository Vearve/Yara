"""
PDF generation utilities for payslips - receipt style format
"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO
from django.conf import settings
import os


def generate_payslip_pdf(payslip, workspace_name=None):
    """
    Generate a receipt-style PDF for a payslip
    Returns BytesIO buffer containing the PDF
    """
    buffer = BytesIO()
    receipt_width = 3.2 * inch
    receipt_height = 11 * inch
    doc = SimpleDocTemplate(
        buffer,
        pagesize=(receipt_width, receipt_height),
        rightMargin=12,
        leftMargin=12,
        topMargin=12,
        bottomMargin=12
    )
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=12,
        textColor=colors.HexColor('#111111'),
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=9,
        textColor=colors.HexColor('#111111'),
        spaceAfter=4,
        spaceBefore=6,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#333333'),
    )
    
    company_style = ParagraphStyle(
        'CompanyName',
        parent=styles['Heading1'],
        fontSize=11,
        textColor=colors.HexColor('#111111'),
        spaceAfter=2,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Company Name - prefer request/workspace name when provided
    if workspace_name:
        company_name = workspace_name
    else:
        workspace = payslip.employee.workspace
        if not workspace:
            # Try to get workspace from active contract
            try:
                active_contract = payslip.employee.contracts.filter(status='ACTIVE').first()
                if active_contract and active_contract.employee:
                    workspace = active_contract.employee.workspace
            except Exception:
                pass
        company_name = workspace.name if workspace else "Company Name"
    elements.append(Paragraph(company_name.upper(), company_style))
    elements.append(Paragraph("PAYSLIP RECEIPT", title_style))
    elements.append(Spacer(1, 0.08 * inch))
    
    # Employee Information Table
    department_name = 'N/A'
    employee_department = getattr(payslip.employee, 'department', None)
    if employee_department:
        department_name = getattr(employee_department, 'name', None) or str(employee_department)

    emp_data = [
        ['Employee ID', payslip.employee.employee_id],
        ['Employee Name', payslip.employee.full_name],
        ['Department', department_name],
        ['Period', str(payslip.period)],
    ]
    
    emp_table = Table(emp_data, colWidths=[doc.width * 0.45, doc.width * 0.55])
    emp_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#111111')),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, -1), (-1, -1), 0.5, colors.HexColor('#111111')),
    ]))
    elements.append(emp_table)
    elements.append(Spacer(1, 0.1 * inch))
    
    # Earnings Section
    elements.append(Paragraph("EARNINGS", heading_style))
    
    earnings_data = [
        ['Basic Salary', f"{float(payslip.basic_salary):,.2f}"],
    ]
    
    if float(payslip.housing_allowance) > 0:
        earnings_data.append(['Housing Allowance', f"{float(payslip.housing_allowance):,.2f}"])
    if float(payslip.transportation_allowance) > 0:
        earnings_data.append(['Transportation Allowance', f"{float(payslip.transportation_allowance):,.2f}"])
    if float(payslip.lunch_allowance) > 0:
        earnings_data.append(['Lunch Allowance', f"{float(payslip.lunch_allowance):,.2f}"])
    if float(payslip.other_allowances) > 0:
        earnings_data.append(['Other Allowances', f"{float(payslip.other_allowances):,.2f}"])
    if float(payslip.overtime_payment or 0) > 0:
        earnings_data.append(['Overtime', f"{float(payslip.overtime_payment):,.2f}"])
    if float(payslip.bonus or 0) > 0:
        earnings_data.append(['Bonus', f"{float(payslip.bonus):,.2f}"])
    if float(payslip.double_ticket_payment or 0) > 0:
        earnings_data.append(['Double Ticket (Sunday/Holiday)', f"{float(payslip.double_ticket_payment):,.2f}"])
    
    earnings_data.append(['GROSS SALARY', f"{float(payslip.gross_salary):,.2f}"])
    
    earnings_table = Table(earnings_data, colWidths=[doc.width * 0.65, doc.width * 0.35])
    earnings_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#111111')),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, -1), (-1, -1), 0.6, colors.HexColor('#111111')),
    ]))
    elements.append(earnings_table)
    elements.append(Spacer(1, 0.12 * inch))
    
    # Deductions Section
    elements.append(Paragraph("DEDUCTIONS", heading_style))
    
    deductions_data = [
        ['NAPSA (Employee)', f"{float(payslip.napsa_employee):,.2f}"],
        ['PAYE Tax', f"{float(payslip.paye_tax):,.2f}"],
        ['NHIMA (Employee)', f"{float(payslip.nhima_employee):,.2f}"],
    ]
    
    if float(payslip.unpaid_leave_deduction or 0) > 0:
        deductions_data.append(['Unpaid Leave', f"{float(payslip.unpaid_leave_deduction):,.2f}"])
    if float(payslip.absenteeism_deduction or 0) > 0:
        deductions_data.append(['Absenteeism', f"{float(payslip.absenteeism_deduction):,.2f}"])
    
    # Add custom deductions
    for deduction in payslip.custom_deductions.all():
        deductions_data.append([deduction.description, f"{float(deduction.amount):,.2f}"])
    
    deductions_data.append(['TOTAL DEDUCTIONS', f"{float(payslip.total_deductions):,.2f}"])
    
    deductions_table = Table(deductions_data, colWidths=[doc.width * 0.65, doc.width * 0.35])
    deductions_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#111111')),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, -1), (-1, -1), 0.6, colors.HexColor('#111111')),
    ]))
    elements.append(deductions_table)
    elements.append(Spacer(1, 0.15 * inch))
    
    # Net Pay Summary (Large and prominent)
    net_data = [
        ['NET PAY', f"K {float(payslip.net_salary):,.2f}"]
    ]
    
    net_table = Table(net_data, colWidths=[doc.width * 0.65, doc.width * 0.35])
    net_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#111111')),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LINEABOVE', (0, 0), (-1, 0), 1, colors.HexColor('#111111')),
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#111111')),
    ]))
    elements.append(net_table)
    
    # Employer Contributions (informational)
    elements.append(Spacer(1, 0.15 * inch))
    elements.append(Paragraph("EMPLOYER CONTRIBUTIONS", heading_style))
    
    employer_data = [
        ['NAPSA (Employer)', f"K {float(payslip.napsa_employer):,.2f}"],
        ['NHIMA (Employer)', f"K {float(payslip.nhima_employer):,.2f}"],
    ]
    
    employer_table = Table(employer_data, colWidths=[doc.width * 0.65, doc.width * 0.35])
    employer_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, -1), (-1, -1), 0.3, colors.HexColor('#111111')),
    ]))
    elements.append(employer_table)
    
    # Notes if any
    if payslip.notes:
        elements.append(Spacer(1, 0.3 * inch))
        elements.append(Paragraph("NOTES", heading_style))
        notes_para = Paragraph(payslip.notes, normal_style)
        elements.append(notes_para)
    
    # Footer
    elements.append(Spacer(1, 0.5 * inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#999999'),
        alignment=TA_CENTER
    )
    elements.append(Paragraph("This is a computer-generated payslip and does not require a signature.", footer_style))
    elements.append(Paragraph(f"Generated on: {payslip.period}", footer_style))
    
    # Build PDF
    doc.build(elements)
    
    # Get the value of the BytesIO buffer
    pdf = buffer.getvalue()
    buffer.close()
    
    return pdf
