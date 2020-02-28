@watch
Feature: I can do some things on the site that will make it work hard

  Background:
    Given I am on the staging site
    And If I'm not logged in, I create an account with username prefix "testuser" and password "testpass"

  Scenario: I can create an example classroom and create some sequences
    Given I visit the "environmentList" page
    And the ".help-icon" is removed
    And I click on the item with the selector ".generate-example-classroom"
    When I click on the item with the selector ".toggle-accordion.o--header-link .environment-name" if ".toggle-accordion.o--header-link + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__inner .carat" if ".c--accordion-item__inner + .inner-container" is display none
    Then A classroom exists with the name "Example Classroom"
    And I see a ".demographic-labels" with the text "Gender, SES, Race, Language Proficiency, Popularity"
    And I see a ".discourse-labels" with the text "Student Talk (Type), Student Talk (Length), Teacher Question (Type), Teacher Wait Time, Teacher Tone"
    And I see a ".subject-labels" with the text "Joey, Jennifer, Wendy, Debra, Joe, Silvia, Jalen, Rick, Brenda, Marcus, Kristy, Russell, Lequoia, Sam, Halona, Julisa, Niral, Candace, Carlos, Lawrence, Tama, Thomas, Monet, Lark, Faye, Elan, Garrett, Nia, Zahra, Parker, Phoung, Janelle"
    And I see 6 ".observation-labels"
    And I see a ".observation-labels=(1 - WC) Observation #1 - 9/4"
    And I don't see a ".observation-labels=(7 - WC) Observation #7 - 9/4"

