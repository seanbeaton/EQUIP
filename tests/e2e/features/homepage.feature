#@watch
Feature: Visit the homepage
  As a user
  I want to see the homepage

  Background:
    Given I am on the site

  Scenario: Click learn more
    Given I visit the homepage
    When I click "learn more" with class "c--landing-page__c2a-learn-more-link"
    Then I see the page header text is "About EQUIP"
  Scenario: Click press see more
    Given I visit the homepage
    When I click "See more" with class "press-link"
    Then I see the page header text is "Equip in the news"