#@watch
Feature: Timeline report page
  I can use the timeline report page

  Background:
    Given I am on the site
    And a clean database
    And I am logged in as a new test user
    And I have generated an example classroom
    And I visit the "timelineReport" page

  Scenario: The contributions view works
    When I don't see a ".report-section--select h2"
    And I click on the item with the selector "#env_select_chosen"
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I see a ".report-section--select h2" with the text "Choose two or more observations"
    And I don't see a ".absent-students-list"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #3 - 9/13 (2018-09-13 - WC)"
    And I see a ".report-section--select h3:nth-of-type(3)" with the text "Observations: "
    And I see a ".absent-students-list p" with the text "There were no absent students"
    And I wait "2000" ms
    # Parameters
    # Teacher Tone x Language Proficiency
    And I click on the item with the selector "#demo_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I wait "2000" ms
    And I click on the item with the selector ".active-result=Gender" in the wrapper "#demo_select_chosen"
    And I click on the item with the selector "#disc_select_chosen"
    And I wait "200" ms
    And I click on the item with the selector ".active-result=Student Talk (Type)" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#disc_opt_select_chosen"
    And I wait "200" ms
    And I click on the item with the selector ".active-result=Explanation" in the wrapper "#disc_opt_select_chosen"
    # Tests
    And I see a ".line--demo[d='M0,238.88888888888889L144,95.55555555555556L648,0']"
    And I see a ".line--demo[d='M0,238.88888888888889L144,95.55555555555556L648,0'] + .dot-container circle[data-demo-name='Boy'][cx='0'][cy='238.88888888888889']"
    And I see a ".line--demo[d='M0,238.88888888888889L144,95.55555555555556L648,0'] + .dot-container circle[data-demo-name='Boy'][cx='144'][cy='95.55555555555556']"
    And I see a ".line--demo[d='M0,238.88888888888889L144,95.55555555555556L648,0'] + .dot-container circle[data-demo-name='Boy'][cx='648'][cy='0']"

    And I see a ".line--demo[d='M0,95.55555555555556L144,238.88888888888889L648,191.11111111111111']"
    And I see a ".line--demo[d='M0,95.55555555555556L144,238.88888888888889L648,191.11111111111111'] + .dot-container circle[data-demo-name='Girl'][cx='0'][cy='95.55555555555556']"
    And I see a ".line--demo[d='M0,95.55555555555556L144,238.88888888888889L648,191.11111111111111'] + .dot-container circle[data-demo-name='Girl'][cx='144'][cy='238.88888888888889']"
    And I see a ".line--demo[d='M0,95.55555555555556L144,238.88888888888889L648,191.11111111111111'] + .dot-container circle[data-demo-name='Girl'][cx='648'][cy='191.11111111111111']"

    And I see a ".line--demo[d='M0,382.22222222222223L144,334.44444444444446L648,430']"
    And I see a ".line--demo[d='M0,382.22222222222223L144,334.44444444444446L648,430'] + .dot-container circle[data-demo-name='Nonbinary'][cx='0'][cy='382.22222222222223']"
    And I see a ".line--demo[d='M0,382.22222222222223L144,334.44444444444446L648,430'] + .dot-container circle[data-demo-name='Nonbinary'][cx='144'][cy='334.44444444444446']"
    And I see a ".line--demo[d='M0,382.22222222222223L144,334.44444444444446L648,430'] + .dot-container circle[data-demo-name='Nonbinary'][cx='648'][cy='430']"


