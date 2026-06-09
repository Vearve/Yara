"""
Payroll calculation tests.
Covers NAPSA, PAYE, NHIMA, net pay, and edge cases per Zambian 2025/2026 rates.
Run with: python manage.py test apps.payroll.tests
"""

from django.test import SimpleTestCase as TestCase
from .utils import (
    calculate_zambian_payroll,
    calculate_unpaid_leave_deduction,
    get_statutory_settings,
    get_paye_tax_bands,
)


class StatutorySettingsDefaultsTest(TestCase):
    """get_statutory_settings returns correct Zambian defaults when no workspace given."""

    def test_napsa_rate(self):
        s = get_statutory_settings()
        self.assertAlmostEqual(s['napsa_rate'], 0.05)

    def test_napsa_ceiling(self):
        s = get_statutory_settings()
        self.assertAlmostEqual(s['napsa_ceiling'], 34164.00)

    def test_nhima_rate(self):
        s = get_statutory_settings()
        self.assertAlmostEqual(s['nhima_rate'], 0.01)


class NAPSACalculationTest(TestCase):
    """NAPSA: 5% of gross, capped at ceiling × rate = K1,708.20."""

    CEILING = 34164.00
    RATE = 0.05
    MAX_NAPSA = CEILING * RATE  # K1,708.20

    def _napsa(self, gross):
        return calculate_zambian_payroll(gross)['deductions']['napsa_employee']

    def test_below_ceiling(self):
        # K10,000 gross → NAPSA = K500
        self.assertAlmostEqual(self._napsa(10_000), 500.00, places=2)

    def test_above_ceiling(self):
        # K50,000 gross → capped at K1,708.20
        self.assertAlmostEqual(self._napsa(50_000), self.MAX_NAPSA, places=2)

    def test_exactly_at_ceiling(self):
        self.assertAlmostEqual(self._napsa(self.CEILING), self.MAX_NAPSA, places=2)

    def test_employer_matches_employee(self):
        result = calculate_zambian_payroll(10_000)
        self.assertAlmostEqual(
            result['deductions']['napsa_employee'],
            result['deductions']['napsa_employer'],
            places=2,
        )


class NHIMACalculationTest(TestCase):
    """NHIMA: 1% of adjusted gross."""

    def _nhima(self, gross):
        return calculate_zambian_payroll(gross)['deductions']['nhima_employee']

    def test_basic(self):
        # K10,000 gross → adjusted ≈ K9,500 (after NAPSA) → NHIMA on adjusted_gross=K9,500
        result = calculate_zambian_payroll(10_000)
        expected = result['adjusted_gross'] * 0.01
        self.assertAlmostEqual(result['deductions']['nhima_employee'], expected, places=2)

    def test_employer_matches_employee(self):
        result = calculate_zambian_payroll(10_000)
        self.assertAlmostEqual(
            result['deductions']['nhima_employee'],
            result['deductions']['nhima_employer'],
            places=2,
        )


class PAYEBandTest(TestCase):
    """PAYE progressive bands — Zambian 2025/2026 rates."""

    def _paye(self, gross):
        return calculate_zambian_payroll(gross)['deductions']['paye']

    def test_zero_band(self):
        # Gross below the 0% threshold (K5,100 chargeable after NAPSA)
        # At K5,000 gross → adjusted = K4,750, NAPSA = K250 → chargeable = K4,500 → tax = K0
        result = calculate_zambian_payroll(5_000)
        self.assertAlmostEqual(result['deductions']['paye'], 0.00, places=2)

    def test_second_band(self):
        # Gross K8,000 → NAPSA K400 → chargeable K7,600
        # Band 1: K0–K5,100 @ 0%          = K0
        # Band 2: K5,100–K7,100 @ 20%     = K2,000 * 0.20 = K400
        # Band 3: K7,100–K7,600 @ 30%     = K500  * 0.30  = K150
        # Total PAYE = K550
        result = calculate_zambian_payroll(8_000)
        self.assertAlmostEqual(result['deductions']['paye'], 550.00, places=2)

    def test_top_band(self):
        # Very high salary — should be in 37% band
        result_high = calculate_zambian_payroll(100_000)
        result_mid = calculate_zambian_payroll(10_000)
        self.assertGreater(result_high['deductions']['paye'], result_mid['deductions']['paye'])

    def test_paye_increases_with_salary(self):
        paye_low = self._paye(5_000)
        paye_mid = self._paye(10_000)
        paye_high = self._paye(20_000)
        self.assertLessEqual(paye_low, paye_mid)
        self.assertLess(paye_mid, paye_high)


class NetPayTest(TestCase):
    """Net pay = gross − total deductions."""

    def test_net_plus_deductions_equals_gross(self):
        gross = 12_000
        result = calculate_zambian_payroll(gross)
        reconstructed = result['net_pay'] + result['deductions']['total']
        self.assertAlmostEqual(reconstructed, gross, places=1)

    def test_unpaid_leave_reduces_net(self):
        result_no_leave = calculate_zambian_payroll(10_000)
        result_with_leave = calculate_zambian_payroll(10_000, unpaid_leave_deduction=500)
        self.assertLess(result_with_leave['net_pay'], result_no_leave['net_pay'])

    def test_custom_deduction_reduces_net(self):
        result_plain = calculate_zambian_payroll(10_000)
        result_deducted = calculate_zambian_payroll(10_000, custom_deductions={'Loan': 200})
        self.assertAlmostEqual(
            result_plain['net_pay'] - result_deducted['net_pay'], 200.00, places=2
        )

    def test_net_is_never_negative_for_normal_salary(self):
        result = calculate_zambian_payroll(8_000)
        self.assertGreater(result['net_pay'], 0)


class UnpaidLeaveDeductionTest(TestCase):
    """calculate_unpaid_leave_deduction uses 26-day Zambian standard."""

    def test_one_day(self):
        # K10,000 / 26 * 1 = K384.62
        deduction = calculate_unpaid_leave_deduction(10_000, 1)
        self.assertAlmostEqual(deduction, 384.62, places=2)

    def test_five_days(self):
        deduction = calculate_unpaid_leave_deduction(10_000, 5)
        self.assertAlmostEqual(deduction, 1923.08, places=2)

    def test_custom_working_days(self):
        # Use 22 days instead of 26
        deduction = calculate_unpaid_leave_deduction(10_000, 1, working_days_in_month=22)
        expected = round(10_000 / 22, 2)
        self.assertAlmostEqual(deduction, expected, places=2)

    def test_zero_days(self):
        self.assertAlmostEqual(calculate_unpaid_leave_deduction(10_000, 0), 0.00, places=2)


class ZeroGrossSalaryTest(TestCase):
    """Edge case: zero gross should not raise and should return zero deductions."""

    def test_zero_gross(self):
        result = calculate_zambian_payroll(0)
        self.assertEqual(result['net_pay'], 0)
        self.assertEqual(result['deductions']['paye'], 0)
        self.assertEqual(result['deductions']['napsa_employee'], 0)
        self.assertEqual(result['deductions']['nhima_employee'], 0)
