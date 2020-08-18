#@watch
Feature: The header works
  As a logged out user
  The header should work

  Background:
    Given I am on the site
    And a clean database

  Scenario: Click the header logo
    Given I visit the about page
    When I click "the logo" with class "equip-logo"
    Then I see the page header text is "EQUIP"

  Scenario: Click the header about link
    Given I visit the homepage
    When I click on the link with path "/about" in the wrapper "header-container"
    Then I see the page header text is "About equip"

  Scenario: Click the header press link
    Given I visit the homepage
    When I click on the link with path "/press" in the wrapper "header-container"
    Then I see the page header text is "Equip in the news"

  Scenario: Click the header help link
    Given I visit the homepage
    When I click on the link with path "/help" in the wrapper "header-container"
    Then I see the page header text is "Help"

  Scenario: Click the header login link
    Given I visit the homepage
    When I click on the link with path "/login" in the wrapper "header-container"
    Then I see a ".login-form h3" with the text "Log in"
