#@watch
Feature: Heatmap report page
  I can use the heatmap report page

  Background:
    Given I am on the site
    And a clean database
    And I am logged in as a new test user
    And I have generated an example classroom
    And I visit the "heatmapReport" page

  Scenario: The whole classrooms view works
    When I don't see a ".heatmap-report__graph h3"
    And I click on the item with the selector "#env_select_chosen"
    And I wait "5000" ms
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I see a ".heatmap-report__graph h3" with the text "Click on a student"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #3 - 9/13 (2018-09-13 - WC)"
    And I see a ".report-section--select h3:nth-of-type(3)" with the text "Observations: "
    And I wait "10000" ms
    Then I see 32 ".student-box"
    # spot checks
    And I see a ".c--observation__student-box=Jalen (13)" in the wrapper ".student-box:not(.disabled-student)"
    And I see a ".c--observation__student-box=Carlos (7)" in the wrapper ".student-box:not(.disabled-student)"
    And I see a ".c--observation__student-box=Niral (0)" in the wrapper ".student-box:not(.disabled-student)"
    And I see a ".c--observation__student-box=Zahra (3)" in the wrapper ".student-box:not(.disabled-student)"
    # test different filters
    And I don't see a ".heatmap-report-wrapper.filters-active"
    And I click on the item with the selector "select[data-filter-demo-name='Gender'] + .chosen-container"
    And I click on the item with the selector ".active-result=Boy" in the wrapper "select[data-filter-demo-name='Gender'] + .chosen-container"
    And I see a ".heatmap-report-wrapper.filters-active"
    And I see a ".c--observation__student-box=Phoung (7)" in the wrapper ".student-box:not(.disabled-student)"
    And I see a ".c--observation__student-box=Jennifer (3)" in the wrapper ".student-box:not(.disabled-student)"
    And I see a ".c--observation__student-box=Joe (0)" in the wrapper ".student-box.disabled-student"
    # Add another filter
    And I click on the item with the selector "select[data-filter-demo-name='SES'] + .chosen-container"
    And I click on the item with the selector ".active-result=Higher" in the wrapper "select[data-filter-demo-name='SES'] + .chosen-container"
    And I see a ".c--observation__student-box=Phoung (7)" in the wrapper ".student-box.disabled-student"
    And I see a ".c--observation__student-box=Jennifer (3)" in the wrapper ".student-box:not(.disabled-student)"
    And I see a ".c--observation__student-box=Joe (0)" in the wrapper ".student-box.disabled-student"

  Scenario: The demographic groups view works
    When I click on the item with the selector "#env_select_chosen"
    And I wait "5000" ms
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    When I click on the item with the selector "#students_sort_chosen"
    And I click on the item with the selector ".active-result=Demographic Groups" in the wrapper "#students_sort_chosen"
    And I wait "4000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #3 - 9/13 (2018-09-13 - WC)"
    And I wait "10000" ms
    And I see a "#Boy-label=Boy"
    And I see a "#Girl-label=Girl"
    And I see a ".c--observation__student-box=Rick (17)" in the wrapper ".student-box:nth-of-type(2)[data-contrib-count='17']"
    And I see a ".c--observation__student-box=Debra (7)" in the wrapper "#Girl-label + .student-box:nth-of-type(16)[data-contrib-count='7']"

  Scenario: The modifying observations automatically changes the data displayed
    When I click on the item with the selector "#env_select_chosen"
    And I wait "5000" ms
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I wait "4000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"
    And I wait "10000" ms
    And I see a ".c--observation__student-box=Rick (8)" in the wrapper ".student-box:not(.disabled-student)"
    And I click on the item with the selector ".vis-item-content=Observation #3 - 9/13 (2018-09-13 - WC)"
    And I see a ".c--observation__student-box=Rick (17)" in the wrapper ".student-box:not(.disabled-student)"

  Scenario: The student detail view works
    When I click on the item with the selector "#env_select_chosen"
    And I wait "5000" ms
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I wait "4000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"
    And I wait "10000" ms
    And I click on the item with the selector ".c--observation__student-box=Rick (8)"
    And I see a ".demo-label=Gender:" in the wrapper ".student-spotlight__demographics li:nth-child(1)"
    And I see a ".demo-value=Boy" in the wrapper ".student-spotlight__demographics li:nth-child(1)"
    And I see a ".demo-label=SES:" in the wrapper ".student-spotlight__demographics li:nth-child(2)"
    And I see a ".demo-value=Higher" in the wrapper ".student-spotlight__demographics li:nth-child(2)"

    And I click on the item with the selector "#student_spotlight__discourse_select_chosen"
    And I click on the item with the selector ".active-result=Student Talk (Type)" in the wrapper "#student_spotlight__discourse_select_chosen"

    # Contributions
    And I see a ".student-contributions-graph__graph .bar-group:nth-child(1) rect[y='145'][height='145']"
    And I see a ".student-contributions-graph__graph .bar-group:nth-child(2) rect[y='218'][height='72']"
    And I see a ".student-contributions-graph__graph .bar-group:nth-child(3) rect[y='218'][height='72']"
    And I see a ".student-contributions-graph__graph .bar-group:nth-child(4) rect[y='0'][height='290']"
    And I see a ".student-contributions-graph__graph .bar-group:nth-child(4) rect[y='181'][height='109']"

    # Participation over time
    And I see a ".line--total[d='M0,0L648,172']" in the wrapper ".student-participation-time__graph"
    And I see a ".line--discdim:nth-child(2)[d='M0,258L648,258']" in the wrapper ".student-participation-time__graph"
    And I see a ".line--discdim:nth-child(4)[d='M0,258L648,430']" in the wrapper ".student-participation-time__graph"
    And I see a ".line--discdim:nth-child(6)[d='M0,344L648,344']" in the wrapper ".student-participation-time__graph"