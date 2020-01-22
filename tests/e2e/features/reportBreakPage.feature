@watch
Feature: Report selection page
  I can see the report selection page

  Background:
    Given I am on the site
    And a clean database
    And I am logged in as a new test user
#    And I have generated an example classroom

  Scenario: I see the report type selection page
    Given I visit the "reportsSelection" page
    Then I see 6 ".report-select__option"

  Scenario: The interactive view button works
    Given I visit the "reportsSelection" page
    When I click on the item with the selector ".option--interactive"
    Then I am on the route "interactiveReport"

  Scenario: The timeline view button works
    Given I visit the "reportsSelection" page
    When I click on the item with the selector ".option--timeline"
    Then I am on the route "timelineReport"

  Scenario: The heatmap view button works
    Given I visit the "reportsSelection" page
    When I click on the item with the selector ".option--heatmap"
    Then I am on the route "heatmapReport"

  Scenario: The heatmap view button works
    Given I visit the "reportsSelection" page
    When I click on the item with the selector ".option--student-histogram"
    Then I am on the route "histogramReport"

  Scenario: The heatmap view button works
    Given I visit the "reportsSelection" page
    When I click on the item with the selector ".option--group-work"
    Then I am on the route "groupWorkReport"

  Scenario: The heatmap view button works
    Given I visit the "reportsSelection" page
    When I click on the item with the selector ".option--static"
    Then I am on the route "staticReport"
