import pytest

from mavis.test.annotations import issue
from mavis.test.data import ClassFileMapping, CohortsFileMapping, VaccsFileMapping
from mavis.test.models import Programme, ReportFormat, Vaccine


@pytest.fixture
def setup_cohort_upload(
    log_in_as_nurse, dashboard_page, programmes_page, import_records_page
):
    dashboard_page.click_programmes()
    programmes_page.navigate_to_cohort_import(Programme.HPV)


@pytest.fixture
def setup_reports(log_in_as_nurse, dashboard_page):
    dashboard_page.click_programmes()


@pytest.fixture
def setup_record_a_vaccine(
    log_in_as_nurse,
    schools,
    dashboard_page,
    sessions_page,
):
    school = schools[Programme.HPV][0]

    try:
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        yield
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.fixture
def setup_mavis_1729(
    log_in_as_nurse,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    try:
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list_for_current_year(
            ClassFileMapping.RANDOM_CHILD,
            year_group,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, Programme.HPV)
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        import_records_page.upload_and_verify_output(
            file_mapping=VaccsFileMapping.HPV_DOSE_TWO, session_id=session_id
        )
        dashboard_page.click_mavis()
        dashboard_page.click_programmes()
        yield
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.fixture
def setup_mav_854(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    try:
        batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, Programme.HPV)
        sessions_page.schedule_a_valid_session(past=True)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list_for_current_year(
            ClassFileMapping.FIXED_CHILD, year_group
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_today(
            "Community clinic", Programme.HPV
        )
        dashboard_page.click_mavis()
        yield batch_name
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.mark.cohorts
def test_cohort_upload_positive(setup_cohort_upload, import_records_page):
    import_records_page.import_class_list_for_current_year(CohortsFileMapping.POSITIVE)


@pytest.mark.cohorts
def test_cohort_upload_negative(setup_cohort_upload, import_records_page):
    import_records_page.import_class_list_for_current_year(CohortsFileMapping.NEGATIVE)


@pytest.mark.cohorts
def test_cohorts_file_structure(setup_cohort_upload, import_records_page):
    import_records_page.import_class_list_for_current_year(
        CohortsFileMapping.INVALID_STRUCTURE
    )


@pytest.mark.cohorts
def test_cohorts_no_record(setup_cohort_upload, import_records_page):
    import_records_page.import_class_list_for_current_year(
        CohortsFileMapping.HEADER_ONLY
    )


@pytest.mark.cohorts
def test_cohorts_empty_file(setup_cohort_upload, import_records_page):
    import_records_page.import_class_list_for_current_year(
        CohortsFileMapping.EMPTY_FILE
    )


@issue("MAV-909")
@issue("MAV-1716")
@pytest.mark.cohorts
@pytest.mark.bug
def test_cohorts_archive_and_unarchive(
    setup_cohort_upload,
    programmes_page,
    dashboard_page,
    children_page,
    import_records_page,
    children,
):
    child = children[Programme.HPV][0]

    import_records_page.import_class_list_for_current_year(
        CohortsFileMapping.FIXED_CHILD
    )

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.search_with_all_filters_for_child_name(str(child))
    children_page.click_record_for_child(child)
    children_page.archive_child_record()

    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.navigate_to_cohort_import(Programme.HPV)

    import_records_page.import_class_list_for_current_year(
        CohortsFileMapping.FIXED_CHILD
    )

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.search_with_all_filters_for_child_name(str(child))
    children_page.click_record_for_child(child)
    children_page.check_child_is_unarchived()


@pytest.mark.rav
def test_rav_triage_consent_given(
    setup_record_a_vaccine,
    schools,
    sessions_page,
    import_records_page,
    dashboard_page,
    verbal_consent_page,
    children,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_import_class_lists()
    import_records_page.import_class_list_for_current_year(
        CohortsFileMapping.FIXED_CHILD, child.year_group
    )

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()
    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    verbal_consent_page.parent_phone_positive(child.parents[0])

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(school, Programme.HPV)

    sessions_page.click_register_tab()
    sessions_page.navigate_to_update_triage_outcome(child, Programme.HPV)
    sessions_page.select_yes_safe_to_vaccinate()
    sessions_page.click_save_triage()
    sessions_page.verify_triage_updated_for_child()


@pytest.mark.rav
def test_rav_triage_consent_refused(
    setup_record_a_vaccine,
    schools,
    sessions_page,
    import_records_page,
    dashboard_page,
    verbal_consent_page,
    children,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_import_class_lists()
    import_records_page.import_class_list_for_current_year(
        CohortsFileMapping.FIXED_CHILD, child.year_group
    )

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()
    sessions_page.navigate_to_consent_response(child, Programme.HPV)

    verbal_consent_page.parent_paper_refuse_consent(child.parents[0])
    verbal_consent_page.expect_text_in_alert(str(child))

    sessions_page.select_consent_refused()
    sessions_page.click_child(child)
    sessions_page.click_session_activity_and_notes()
    sessions_page.check_session_activity_entry(
        f"Consent refused by {child.parents[0].name_and_relationship}"
    )


@pytest.mark.rav
@pytest.mark.bug
def test_rav_edit_dose_to_not_given(
    setup_mavis_1729, programmes_page, children_page, children
):
    child = children[Programme.HPV][0]

    programmes_page.click_programme_current_year(Programme.HPV)
    programmes_page.click_children()
    programmes_page.search_for_child(child)
    programmes_page.click_child(child)
    children_page.click_vaccination_details(Programme.HPV)
    programmes_page.click_edit_vaccination_record()
    programmes_page.click_change_outcome()
    programmes_page.click_they_refused_it()
    programmes_page.click_continue()
    programmes_page.click_save_changes()
    programmes_page.expect_alert_text("Vaccination outcome recorded for HPV")


@pytest.mark.rav
@pytest.mark.bug
def test_rav_verify_excel_mav_854(
    setup_mav_854,
    schools,
    clinics,
    children_page,
    sessions_page,
    dashboard_page,
    verbal_consent_page,
    children,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]
    batch_name = setup_mav_854

    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.HPV)

    # temporary approach for rollover
    # if the rollover period has passed, revert the commit this was added in
    sessions_page.click_send_clinic_invitations_link()
    sessions_page.click_send_clinic_invitations_button()

    dashboard_page.click_mavis()
    dashboard_page.click_children()

    children_page.search_with_all_filters_for_child_name(str(child))
    children_page.click_record_for_child(child)
    children_page.click_session_for_programme(
        "Community clinic", Programme.HPV, check_date=True
    )
    sessions_page.click_record_a_new_consent_response()
    verbal_consent_page.parent_verbal_positive(
        parent=child.parents[0], change_phone=False
    )
    sessions_page.register_child_as_attending(child)
    sessions_page.record_vaccs_for_child(
        child=child,
        programme=Programme.HPV,
        batch_name=batch_name,
        at_school=False,
    )
    sessions_page.check_location_radio(clinics[0])
    sessions_page.click_continue_button()
    sessions_page.click_confirm_button()
    sessions_page.expect_alert_text("Vaccination outcome recorded for HPV")
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    assert sessions_page.get_session_id_from_offline_excel()


@pytest.mark.reports
def test_verify_careplus_report_for_hpv(setup_reports, programmes_page):
    programmes_page.verify_report_format(
        programme=Programme.HPV, report_format=ReportFormat.CAREPLUS
    )


@pytest.mark.reports
def test_verify_careplus_report_for_doubles(
    setup_reports, dashboard_page, programmes_page
):
    programmes_page.verify_report_format(
        programme=Programme.MENACWY, report_format=ReportFormat.CAREPLUS
    )
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.verify_report_format(
        programme=Programme.TD_IPV, report_format=ReportFormat.CAREPLUS
    )


@pytest.mark.reports
def test_verify_csv_report_for_hpv(setup_reports, programmes_page):
    programmes_page.verify_report_format(
        programme=Programme.HPV, report_format=ReportFormat.CSV
    )


@pytest.mark.reports
def test_verify_csv_report_for_doubles(setup_reports, dashboard_page, programmes_page):
    programmes_page.verify_report_format(
        programme=Programme.MENACWY, report_format=ReportFormat.CSV
    )
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.verify_report_format(
        programme=Programme.TD_IPV, report_format=ReportFormat.CSV
    )


@pytest.mark.reports
def test_verify_systmone_report_for_hpv(setup_reports, programmes_page):
    programmes_page.verify_report_format(
        programme=Programme.HPV, report_format=ReportFormat.SYSTMONE
    )
