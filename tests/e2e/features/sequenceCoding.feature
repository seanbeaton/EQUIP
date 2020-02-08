@watch
Feature: Observation creation
  I can create an observation

  Background:
    Given I am on the site
    And a clean database
    And I am logged in as a new test user
    And I have generated an example classroom
    And I visit the "environmentList" page

  Scenario: I can create an whole class observation
    When I click on the item with the selector ".toggle-accordion.o--header-link .environment-name" if ".toggle-accordion.o--header-link + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__inner .carat" if ".c--accordion-item__inner + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__create-new-classroom"
    And Fill in the field with selector "#observationName" with the value "Test observation name"
    And Fill in the field with selector "#observationDescription" with the value "Short description"
    And I click on the item with the selector "#save-obs-name"
    And I click on the item with the selector "#save-absent-students"



