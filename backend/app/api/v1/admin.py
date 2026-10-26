from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import require_admin
from app.models.user import User
from app.schemas.admin import (
    DailyActivityReportItem,
    UserActivityReportItem,
    AdminSummaryStats,
)
from app.services.report_service import ReportService

router = APIRouter(prefix="/admin", tags=["Administration & Reports"])


@router.get(
    "/reports/daily",
    response_model=List[DailyActivityReportItem],
    status_code=status.HTTP_200_OK,
    summary="Daily activity report (Admin only)",
)
def get_daily_activity_report(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> List[DailyActivityReportItem]:
    """Retrieve daily report showing number of active users and number of correct guesses per day."""
    return ReportService.get_daily_activity_report(db)


@router.get(
    "/reports/users",
    response_model=List[UserActivityReportItem],
    status_code=status.HTTP_200_OK,
    summary="User-level activity report (Admin only)",
)
def get_user_activity_report(
    user_id: Optional[UUID] = Query(
        None, description="Filter by specific user ID"
    ),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> List[UserActivityReportItem]:
    """Retrieve user-level report showing date, number of words tried, and number of correct guesses."""
    return ReportService.get_user_activity_report(db, user_id=user_id)


@router.get(
    "/reports/summary",
    response_model=AdminSummaryStats,
    status_code=status.HTTP_200_OK,
    summary="Admin KPI summary stats (Admin only)",
)
def get_summary_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> AdminSummaryStats:
    """Retrieve high level statistics: total players, total games, total wins, and win rate."""
    return ReportService.get_summary_stats(db)
