#@watch
Feature: User registration
  As a logged out user
  I should be able to create an account

  Background:
    Given I am on the site
    And a clean database
    And a new test user exists
    And I am logged out

  Scenario: I can log in to an existing account
    Given I visit the login page
    When I log in to an account with the default username and password
    Then I am logged in as the user "testuser"

  Scenario: I can't log in to an existing account with a wrong password
    Given I visit the "login" page
    When I log in to an account with the username "testuser" and password "wrongpass"
    Then I see a ".at-form > .at-title + .at-error > p" with the text "Login forbidden"