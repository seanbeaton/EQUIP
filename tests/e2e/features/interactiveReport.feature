@watch
Feature: Report selection page
  I can see the report selection page

  Background:
    Given I am on the site
    And a clean database
    And I am logged in as a new test user
    And I have generated an example classroom
    And I visit the "interactiveReport" page

  Scenario: The equity ratio view works
    When I don't see a ".report-section--select h4"
    And I click on the item with the selector "#env_select_chosen"
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I see a ".report-section--select h4" with the text "Choose one or more observations"
    And I don't see a ".absent-students-list"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I see a ".absent-students-list p" with the text "There were no absent students"
    # Teacher Tone x Language Proficiency
    And I click on the item with the selector "#disc_select_chosen"
    And I click on the item with the selector ".active-result=Teacher Tone" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I click on the item with the selector ".active-result=Race" in the wrapper "#demo_select_chosen"
    # Tests
    Then I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Asian'][height='85']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Black'][height='171']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Latinx'][height='0']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Native'][height='85']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='White'][height='171']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Mixed'][height='0']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Other'][height='0']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Neutral'] rect[data-bar-x='Asian'][height='171']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Neutral'] rect[data-bar-x='Black'][height='470']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Neutral'] rect[data-bar-x='Latinx'][height='85']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Neutral'] rect[data-bar-x='Native'][height='43']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Neutral'] rect[data-bar-x='White'][height='342']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Neutral'] rect[data-bar-x='Mixed'][height='0']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Neutral'] rect[data-bar-x='Other'][height='0']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Dismissive'] rect[data-bar-x='Asian'][height='0']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Dismissive'] rect[data-bar-x='Black'][height='43']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Dismissive'] rect[data-bar-x='Latinx'][height='43']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Dismissive'] rect[data-bar-x='Native'][height='43']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Dismissive'] rect[data-bar-x='White'][height='0']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Dismissive'] rect[data-bar-x='Mixed'][height='0']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Dismissive'] rect[data-bar-x='Other'][height='0']"
    # Student Talk x Language Proficiency
    And I click on the item with the selector "#disc_select_chosen"
    And I click on the item with the selector ".active-result=Student Talk (Length)" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I click on the item with the selector ".active-result=Language Proficiency" in the wrapper "#demo_select_chosen"
    # Tests
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Extended Contribution'] rect[data-bar-x='English Dominant'][height='274']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Extended Contribution'] rect[data-bar-x='Emergent Multilingual'][height='20']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Brief Contribution'] rect[data-bar-x='English Dominant'][height='450']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Brief Contribution'] rect[data-bar-x='Emergent Multilingual'][height='78']"
    # Text swap button
    And I click on the item with the selector ".swappable__button"
    # Tests
    And I see a ".interactive-report__graph .bar-group[data-bar-group='English Dominant'] rect[data-bar-x='Extended Contribution'][height='274']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='English Dominant'] rect[data-bar-x='Brief Contribution'][height='450']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Emergent Multilingual'] rect[data-bar-x='Extended Contribution'][height='20']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Emergent Multilingual'] rect[data-bar-x='Brief Contribution'][height='78']"
    # Hovers
    And I hover over the item with the selector ".interactive-report__graph .bar-group[data-bar-group='English Dominant'] rect[data-bar-x='Extended Contribution'][height='274']"
    And I see an ".interactive-report__sidebar .panel__title .group" with the text "English Dominant"
    And I see an ".interactive-report__sidebar .panel__title .bar" with the text "Extended Contribution"
    And I see 9 ".interactive-report__sidebar .student-bar--contributor"
    And I see 5 ".interactive-report__sidebar .student-bar--non-contributor"
    And I see an ".interactive-report__sidebar .student-bar" with the text "Janelle (3)"

  Scenario: Adding another observation changes the data displayed
    When I click on the item with the selector "#env_select_chosen"
    And I click on the item with the selector ".active-result=Example Classroom" in the wrapper "#env_select_chosen"
    And I see a ".report-section--select h4" with the text "Choose one or more observations"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    # Teacher Tone x Language Proficiency
    And I click on the item with the selector "#disc_select_chosen"
    And I click on the item with the selector ".active-result=Teacher Tone" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I click on the item with the selector ".active-result=Race" in the wrapper "#demo_select_chosen"
    # Tests
    Then I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Asian'][height='85']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Black'][height='171']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Latinx'][height='0']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Native'][height='85']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='White'][height='171']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Mixed'][height='0']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Other'][height='0']"
    # Add another observation
    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"
    # Retest
    Then I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Asian'][height='47']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Black'][height='117']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Latinx'][height='23']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Native'][height='141']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='White'][height='235']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Mixed'][height='0']"
    And I see a ".interactive-report__graph .bar-group[data-bar-group='Enthusiastic'] rect[data-bar-x='Other'][height='0']"
