#@watch
Feature: Group work report page
  I can use the group work page

  Background:
    Given I am on the site
    And a clean database
    And I am logged in as a new test user
    And I have generated an example classroom
    And I visit the "groupWorkReport" page

  Scenario: The group work boxes appear
    When I click on the item with the selector "#env_select_chosen"
    And I wait "5000" ms
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Small group #1 - 9/15 (2018-09-15 - SG)"
    And I wait "1000" ms
    Then I see 1 ".student-group" in the wrapper "#group-work-d3-wrapper"
    And I click on the item with the selector ".vis-item-content=Small Group #2 - 9/18 (2018-09-18 - SG)"
    And I wait "1000" ms
    Then I see 2 ".student-group" in the wrapper "#group-work-d3-wrapper"
    And I click on the item with the selector ".vis-item-content=Small Group #3 - 9/25 (2018-09-25 - SG)"
    And I wait "1000" ms
    Then I see 3 ".student-group" in the wrapper "#group-work-d3-wrapper"

  Scenario: The group bar graph works
    When I click on the item with the selector "#env_select_chosen"
    And I wait "5000" ms
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Small group #1 - 9/15 (2018-09-15 - SG)"
    And I wait "2000" ms
    And I click on the item with the selector ".graph-display-type__option[data-display-graph-type='bars']"
    And I wait "1000" ms
    And I see 4 ".student-vbar"
    And I see 1 ".student-vbar[height='218.5'][x='9']"
    And I see 1 ".student-vbar[height='51.75'][x='99']"
    And I see 1 ".student-vbar[height='37.375'][x='189']"
    And I see 1 ".student-vbar[height='54.625'][x='279']"

  Scenario: The demographics selector works
    When I click on the item with the selector "#env_select_chosen"
    And I wait "5000" ms
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Small group #1 - 9/15 (2018-09-15 - SG)"
    And I wait "1000" ms
    And I click on the item with the selector "#group_work_demographic_chosen"
    And I click on the item with the selector ".active-result=Gender" in the wrapper "#group_work_demographic_chosen"
    And The values of css property "background-color" on elements ".key--label:nth-child(1) .key--color" and ".student-group__students > .student-box:nth-child(1) > .student-box__wrapper" are the same
    And The values of css property "background-color" on elements ".key--label:nth-child(2) .key--color" and ".student-group__students > .student-box:nth-child(1) > .student-box__wrapper" are different
    And The values of css property "background-color" on elements ".key--label:nth-child(2) .key--color" and ".student-group__students > .student-box:nth-child(3) > .student-box__wrapper" are the same


  Scenario: The discourse dimension selector works
    When I click on the item with the selector "#env_select_chosen"
    And I wait "5000" ms
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Small group #1 - 9/15 (2018-09-15 - SG)"
    And I click on the item with the selector "#group_work_demographic_chosen"
    And I click on the item with the selector ".active-result=Gender" in the wrapper "#group_work_demographic_chosen"
    And I click on the item with the selector "#disc_select_chosen"
    And I click on the item with the selector ".active-result=Student Talk (Type)" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector ".graph-display-type__option[data-display-graph-type='bars']"
    And I click on the item with the selector "#disc_opt_select_chosen"
    And I click on the item with the selector ".active-result=Explanation" in the wrapper "#disc_opt_select_chosen"
    And I wait "1000" ms
    And I see 1 ".student-vbar[height='230'][x='9']"
    And I see 1 ".student-vbar[height='70.76923076923077'][x='99']"
    And I see 1 ".student-vbar[height='35.38461538461539'][x='189']"
    And I see 1 ".student-vbar[height='70.76923076923077'][x='279']"
    And I click on the item with the selector "#disc_opt_select_chosen"
    And I click on the item with the selector ".active-result=Procedural" in the wrapper "#disc_opt_select_chosen"
    And I see 1 ".student-vbar[height='230'][x='9']"
    And I see 1 ".student-vbar[height='57.5'][x='99']"
    And I see 1 ".student-vbar[height='32.85714285714283'][x='189']"
    And I see 1 ".student-vbar[height='41.071428571428584'][x='279']"
