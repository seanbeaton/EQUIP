#@watch
Feature: Classroom parameters
  As a logged in user
  I should be able to add demographics and discourse dimensions to a classroom

  Background:
    Given I am on the site
    And a clean database
    And I am logged in as a new test user
    And there is an empty classroom with the name "Test Environment"

  Scenario: I apply the default values for class params to an existing classroom
    Given I visit the "environmentList" page
    And the ".help-icon" is removed
    When I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    And I click on the item with the selector ".c-dashboard__accordion > .environment:first-child #edit-class-params"
    And I click on the item with the selector "#load-default-demo"
    And I click on the item with the selector "#save-demo-params"
    And I visit the "environmentList" page
    And the ".help-icon" is removed
    And I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    Then I see a ".demographic-labels" with the text "Race, Gender"

  Scenario: I apply the default values for sequence params to an existing classroom
    Given I visit the "environmentList" page
    And the ".help-icon" is removed
    When I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    And I click on the item with the selector ".c-dashboard__accordion > .environment:first-child #edit-sequence-params"
    And I click on the item with the selector "#load-default-seq"
    And I click on the item with the selector "#save-seq-params"
    And I visit the "environmentList" page
    And the ".help-icon" is removed
    And I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    Then I see a ".discourse-labels" with the text "Teacher Solicitation, Wait Time, Solicitation Method, Length of Talk, Student Talk"