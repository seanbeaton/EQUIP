#@watch
Feature: Static report page
  I can use the static report page and the results are correct for the default observation

  Background:
    Given I am on the site
    And a clean database
    And I am logged in as a new test user
    And I have generated an example classroom
    And I visit the "staticReport" page

  Scenario: I can select a classroom on the report page and other options appear
    When I don't see an ".obs-selection .option-selectors"
    And I don't see an ".dparam-selection .option-selectors"
    And I don't see an ".sparam-selection .option-selectors"
    And I click on the item with the selector ".classroom-selection:first-child"
    Then I see 4 ".obs-selection .option-selectors"
    And I see 6 ".dparam-selection .option-selectors"
    And I see 6 ".sparam-selection .option-selectors"
    And I see an ".obs-selection .option-selectors[data_id='999']"
    And I see an ".dparam-selection .option-selectors[data_id='999']"
    And I see an ".dparam-selection .option-selectors[data_id='Gender']"
    And I see an ".sparam-selection .option-selectors[data_id='999']"
    And I see an ".sparam-selection .option-selectors[data_id='Student Talk (Type)']"

  Scenario: Clicking on boxes makes them chosen
    When I click on the item with the selector ".classroom-selection:first-child"
    Then I see an ".classroom-selection.chosen"
    And I click on the item with the selector ".dparam-selection .option-selectors[data_id='Gender']"
    And I see an ".dparam-selection .option-selectors[data_id='Gender'].chosen"
    And I click on the item with the selector ".sparam-selection .option-selectors[data_id='Student Talk (Type)']"
    And I see an ".sparam-selection .option-selectors[data_id='Student Talk (Type)'].chosen"

  Scenario: I can generate a report with all parameters
    When I click on the item with the selector ".classroom-selection:first-child"
    And I click on the item with the selector ".obs-selection .option-selectors[data_id='999']"
    And I click on the item with the selector ".dparam-selection .option-selectors[data_id='999']"
    And I click on the item with the selector ".sparam-selection .option-selectors[data_id='999']"
    And I click on the item with the selector ".generate-button"
    Then I see a ".report-description" with the text "Details about the classroom"

  Scenario: I can see the classroom statistics
    When I click on the item with the selector ".classroom-selection:first-child"
    And I click on the item with the selector ".obs-selection .option-selectors[data_id='999']"
    And I click on the item with the selector ".dparam-selection .option-selectors[data_id='999']"
    And I click on the item with the selector ".sparam-selection .option-selectors[data_id='999']"
    And I click on the item with the selector ".generate-button"
    Then I see a ".class-stats .single-stat:nth-child(1)" with the text "Students who Contributed: 28"
    And I see a ".class-stats .single-stat:nth-child(2)" with the text "Total Students: 32"
    And I see a ".class-stats .single-stat:nth-child(3)" with the text "Percent Contributing: 88.00 %"
    And I see a ".class-stats .single-stat:nth-child(4)" with the text "Total Contributions: 140"
    And I see a ".class-stats .single-stat:nth-child(5)" with the text "Contributions per student: 5.00"
    And I see a ".category-list:nth-child(2) .stat-head" with the text "Student Talk"
    And I see a ".category-list:nth-child(2) .single-stat:nth-child(1)" with the text "Explanation: 39 / 27.86%"
    And I see a ".category-list:nth-child(2) .single-stat:nth-child(2)" with the text "Procedural: 62 / 44.29%"
    And I see a ".category-list:nth-child(2) .single-stat:nth-child(3)" with the text "Factual/Recall: 39 / 27.86%"
    And I see a ".category-list:nth-child(3) .stat-head" with the text "Student Talk (Length)"
    And I see a ".category-list:nth-child(3) .single-stat:nth-child(1)" with the text "Extended Contribution: 49 / 35%"
    And I see a ".category-list:nth-child(3) .single-stat:nth-child(2)" with the text "Brief Contribution: 91 / 65%"
    And I see a ".category-list:nth-child(4) .stat-head" with the text "Teacher Question (Type)"
    And I see a ".category-list:nth-child(4) .single-stat:nth-child(1)" with the text "Explanation: 34 / 24.29%"
    And I see a ".category-list:nth-child(4) .single-stat:nth-child(2)" with the text "Procedural: 72 / 51.43%"
    And I see a ".category-list:nth-child(4) .single-stat:nth-child(3)" with the text "Factual/Recall: 34 / 24.29%"
    And I see a ".category-list:nth-child(5) .stat-head" with the text "Teacher Wait Time"
    And I see a ".category-list:nth-child(5) .single-stat:nth-child(1)" with the text "Long: 36 / 25.71%"
    And I see a ".category-list:nth-child(5) .single-stat:nth-child(2)" with the text "Short: 104 / 74.29%"
    And I see a ".category-list:nth-child(6) .stat-head" with the text "Teacher Tone"
    And I see a ".category-list:nth-child(6) .single-stat:nth-child(1)" with the text "Enthusiastic: 41 / 29.5%"
    And I see a ".category-list:nth-child(6) .single-stat:nth-child(2)" with the text "Neutral: 84 / 60.43%"
    And I see a ".category-list:nth-child(6) .single-stat:nth-child(3)" with the text "Dismissive: 14 / 10.07%"

  Scenario: One of the demographic pie graphs is correct
    When I click on the item with the selector ".classroom-selection:first-child"
    And I click on the item with the selector ".obs-selection .option-selectors[data_id='999']"
    And I click on the item with the selector ".dparam-selection .option-selectors[data_id='999']"
    And I click on the item with the selector ".sparam-selection .option-selectors[data_id='999']"
    And I click on the item with the selector ".generate-button"
    Then I see a ".demo-plots svg:first-child .arc:nth-child(1) path[d='M7.654042494670958e-15,-125A125,125,0,0,1,69.44627912745025,103.93370153781817L0,0Z']"
    Then I see a ".demo-plots svg:first-child .arc:nth-child(1) text" with the text "Boy"


