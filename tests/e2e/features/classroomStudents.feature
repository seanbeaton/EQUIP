#@watch
Feature: Classroom students
  As a logged in user
  I should be able to add students to an existing classroom

  Background:
    Given I am on the site
    And a clean database
    And I am logged in as a new test user

  Scenario: I can create a student
    Given I visit the "environmentList" page
    And the ".help-icon" is removed
    And there is a classroom with the name "Test Environment" with default parameters
    When I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    And I click on the item with the selector ".c-dashboard__accordion > .environment:first-child #edit-class-studs"
    And I create a student named "Han" with the demographics "Race": "Asian" and "Gender": "Girl"
    Then a student named "Han" with the demographics "Race": "Asian" and "Gender": "Girl" exists on the student page

  Scenario: I can create a student with the advanced student page
    Given I visit the "environmentList" page
    And the ".help-icon" is removed
    And there is a classroom with the name "Test Environment" with default parameters
    When I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    And I click on the item with the selector ".c-dashboard__accordion > .environment:first-child #edit-class-studs"
    And I click on the item with the selector "a=advanced student entry page"
    And Fill in the field with selector "tr[data-student-id='new-row--0'] input[data-field='name']" with the value "Jim"
    And Fill in the field with selector "tr[data-student-id='new-row--0'] input[data-field='Race']" with the value "White"
    And Fill in the field with selector "tr[data-student-id='new-row--0'] input[data-field='Gender']" with the value "Boy"
    And I click on the item with the selector ".save-all-students"
    Then a student named "Jim" with the demographics "Race": "White" and "Gender": "Boy" exists

  Scenario: I can delete a student with the advanced student page
    Given I visit the "environmentList" page
    And the ".help-icon" is removed
    And there is a classroom with the name "Test Environment" with default parameters and default students
    When I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    And I click on the item with the selector ".c-dashboard__accordion > .environment:first-child #edit-class-studs"
    And I click on the item with the selector "a=advanced student entry page"
    And a student named "Jim" with the demographics "Race": "White" and "Gender": "Boy" exists
    And I click on the item with the selector ".subjects-table tbody tr:nth-child(1) .remove-student"
    And I click on the item with the selector ".save-all-students"
    Then a student named "Jim" with the demographics "Race": "White" and "Gender": "Boy" does not exist

  Scenario: I can delete all students with the advanced student page
    Given I visit the "environmentList" page
    And the ".help-icon" is removed
    And there is a classroom with the name "Test Environment" with default parameters and default students
    When I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    And I click on the item with the selector ".c-dashboard__accordion > .environment:first-child #edit-class-studs"
    And I click on the item with the selector "a=advanced student entry page"
    And a student named "Jim" with the demographics "Race": "White" and "Gender": "Boy" exists
    And a student named "Han" with the demographics "Race": "Asian" and "Gender": "Girl" exists
    And a student named "Shauna" with the demographics "Race": "Black" and "Gender": "Girl" exists
    And I click on the item with the selector ".delete-all-students"
    And I click on the item with the selector ".save-all-students"
    Then a student named "Jim" with the demographics "Race": "White" and "Gender": "Boy" does not exist
    And a student named "Han" with the demographics "Race": "Asian" and "Gender": "Girl" does not exist
    And a student named "Shauna" with the demographics "Race": "Black" and "Gender": "Girl" does not exist

  Scenario: I can verify a student with valid data on the advanced student page
    Given I visit the "environmentList" page
    And the ".help-icon" is removed
    And there is a classroom with the name "Test Environment" with default parameters
    When I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    And I click on the item with the selector ".c-dashboard__accordion > .environment:first-child #edit-class-studs"
    And I click on the item with the selector "a=advanced student entry page"
    And Fill in the field with selector "tr[data-student-id='new-row--0'] input[data-field='name']" with the value "Jim"
    And Fill in the field with selector "tr[data-student-id='new-row--0'] input[data-field='Race']" with the value "White"
    And Fill in the field with selector "tr[data-student-id='new-row--0'] input[data-field='Gender']" with the value "Boy"
    And I click on the item with the selector ".check-all-students"
    Then an alert with the text "All good!" exists

  Scenario: I can not verify a student with invalid data on the advanced student page
    Given I visit the "environmentList" page
    And the ".help-icon" is removed
    And there is a classroom with the name "Test Environment" with default parameters
    When I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    And I click on the item with the selector ".c-dashboard__accordion > .environment:first-child #edit-class-studs"
    And I click on the item with the selector "a=advanced student entry page"
    And Fill in the field with selector "tr[data-student-id='new-row--0'] input[data-field='name']" with the value "Jim"
    And Fill in the field with selector "tr[data-student-id='new-row--0'] input[data-field='Race']" with the value "White"
    And Fill in the field with selector "tr[data-student-id='new-row--0'] input[data-field='Gender']" with the value "Notagender"
    And I click on the item with the selector ".check-all-students"
    Then an alert with the partial text "Errors found." exists
