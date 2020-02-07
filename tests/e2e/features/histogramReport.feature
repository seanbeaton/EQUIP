#@watch
Feature: Student histogram report page
  I can use the timeline report page

  Background:
    Given I am on the site
    And a clean database
    And I am logged in as a new test user
    And I have generated an example classroom
    And I visit the "histogramReport" page

  Scenario: The columns have the right number of students
    When I click on the item with the selector "#env_select_chosen"
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
#    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"
#    And I click on the item with the selector ".vis-item-content=Observation #3 - 9/13 (2018-09-13 - WC)"
    And I see a ".student-group:nth-child(3) .student-group__title" with the text "2nd Group (n = 3)"
    And I see 11 ".student-group:nth-child(1) .student-box"
    And I see 16 ".student-group:nth-child(2) .student-box"
    And I see 4 ".student-group:nth-child(3) .student-box"
    And I see 0 ".student-group:nth-child(4) .student-box"
    And I see 1 ".student-group:nth-child(5) .student-box"
    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"
    And I wait "2000" ms
    And I see a ".student-group:nth-child(3) .student-group__title" with the text "2nd Group (n = 3 to 4)"
    And I see 5 ".student-group:nth-child(1) .student-box"
    And I see 10 ".student-group:nth-child(2) .student-box"
    And I see 14 ".student-group:nth-child(3) .student-box"
    And I see 2 ".student-group:nth-child(4) .student-box"
    And I see 1 ".student-group:nth-child(5) .student-box"

  Scenario: The demographic selector highlights work
    When I click on the item with the selector "#env_select_chosen"
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I wait "4000" ms
    And I click on the item with the selector "#histogram_demographic_chosen"
    And I click on the item with the selector ".active-result=Gender" in the wrapper "#histogram_demographic_chosen"
    Then The values of css property "background-color" on elements ".key--label:nth-child(1) .key--color" and ".student-box=Carlos (2)" are the same
    And The values of css property "background-color" on elements ".key--label:nth-child(2) .key--color" and ".student-box=Lark (1)" are the same
    And The values of css property "background-color" on elements ".key--label:nth-child(3) .key--color" and ".student-box=Lark (1)" are different
