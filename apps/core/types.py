"""
Type stubs for request objects extended by WorkspaceMiddleware.
Import WorkspaceRequest under TYPE_CHECKING to get accurate Pylance types
without any runtime cost.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from rest_framework.request import Request

if TYPE_CHECKING:
    from apps.core.models import Workspace


class WorkspaceRequest(Request):
    """DRF Request with workspace attributes injected by WorkspaceMiddleware."""

    workspace: Optional[Workspace]
    workspace_id: Optional[int]
    workspace_role: Optional[str]
    _workspace_cache: dict
