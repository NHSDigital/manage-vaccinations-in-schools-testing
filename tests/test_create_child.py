from mavis.test.constants import Programme


def test_create_child(create_child, point_of_care_team):
    year_group = 8
    child = create_child(year_group, point_of_care_team)
    print(child)  # noqa: T201


def test_create_child_eligible_for_programme(
    create_child_eligible_for_programme, point_of_care_team
):
    programme = Programme.HPV
    child = create_child_eligible_for_programme(programme, point_of_care_team)
    print(child)  # noqa: T201


def test_create_child_ineligible_for_programme(
    create_child_ineligible_for_programme, point_of_care_team
):
    programme = Programme.HPV
    child = create_child_ineligible_for_programme(programme, point_of_care_team)
    print(child)  # noqa: T201
