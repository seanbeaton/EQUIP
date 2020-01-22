#@watch
Feature: User registration
  As a logged out user
  I should be able to create an account

  Background:
    Given I am on the site
    And a clean database

  Scenario: I can create an account
    Given I visit the "signup" page
    When I create an account with username "testuser" and password "testuser"
    Then I am logged in as the user "testuser"

  Scenario: I can't create an account if my password is too short
    Given I visit the "signup" page
    When I create an account with username "testuser" and password "short"
    Then I see a "#at-field-password + span" with the text "Minimum required length: 6"