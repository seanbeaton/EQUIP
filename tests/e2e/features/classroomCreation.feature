#@watch
Feature: Classroom registration
  As a logged in user
  I should be able to create a classroom

  Background:
    Given I am on the site
    And a clean database
    And I am logged in as a new test user

  Scenario: I can create a classroom
    Given I visit the "environmentList" page
    When I click on the item with the selector "#env-create-button"
    And Fill in the field with selector "#env-create-modal #environmentName" with the value "Test Environment"
    And I click on the item with the selector "#save-env-name"
    Then A classroom exists with the name "Test Environment"

#  Scenario: I can't create an account if my password is too short
#    Given I visit the "signup" page
#    When I create an account with username "testuser" and password "short"
#    Then I see a "#at-field-password + span" with the text "Minimum required length: 6"