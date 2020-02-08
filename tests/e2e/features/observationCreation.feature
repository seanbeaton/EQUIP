#@watch
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
    And I don't see a ".heatmap-report__graph h3"
    And I click on the item with the selector ".c--accordion-item__create-new-classroom"
    And Fill in the field with selector "#observationName" with the value "Test observation name"
    And Fill in the field with selector "#observationDescription" with the value "Short description"
    And I click on the item with the selector "#save-obs-name"
    And I click on the item with the selector "#save-absent-students"
    Then I see a ".c--accordion-item_inner--count=Observations: 7"
    And I don't see a ".c--accordion-item_inner--count=Observations: 6"
    And I see a ".enter-class=(7 - WC) Test observation name"

  Scenario: I can create an whole class observation with absent students
    When I click on the item with the selector ".toggle-accordion.o--header-link .environment-name" if ".toggle-accordion.o--header-link + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__inner .carat" if ".c--accordion-item__inner + .inner-container" is display none
    And I don't see a ".heatmap-report__graph h3"
    And I click on the item with the selector ".c--accordion-item__create-new-classroom"
    And Fill in the field with selector "#observationName" with the value "Test absent observation name"
    And Fill in the field with selector "#observationDescription" with the value "Short absent description"
    And I click on the item with the selector "#save-obs-name"
    And I click on the item with the selector ".c--observation__student-box=Brenda"
    And I click on the item with the selector ".c--observation__student-box=Elan"
    And I click on the item with the selector ".c--observation__student-box=Carlos"
    And I click on the item with the selector ".c--observation__student-box=Debra"
    And I see a ".c--observation__student-box=Brenda" in the wrapper ".c--observation__student-box-container.selected"
    And I see a ".c--observation__student-box=Elan" in the wrapper ".c--observation__student-box-container.selected"
    And I see a ".c--observation__student-box=Carlos" in the wrapper ".c--observation__student-box-container.selected"
    And I see a ".c--observation__student-box=Debra" in the wrapper ".c--observation__student-box-container.selected"
    And I don't see a ".c--observation__student-box=Candace" in the wrapper ".c--observation__student-box-container.selected"
    And I click on the item with the selector "#save-absent-students"
    And I click on the item with the selector ".enter-class=(7 - WC) Test absent observation name"
    # Check description
    And the field ".observation__description" has the text "Short absent description"
    # Check absent students
    And I see a ".c--observation__student-box=Brenda" in the wrapper ".c--observation__student-box-container:not(.enabled)"
    And I see a ".c--observation__student-box=Elan" in the wrapper ".c--observation__student-box-container:not(.enabled)"
    And I see a ".c--observation__student-box=Carlos" in the wrapper ".c--observation__student-box-container:not(.enabled)"
    And I see a ".c--observation__student-box=Debra" in the wrapper ".c--observation__student-box-container:not(.enabled)"
    # not absent
    And I see a ".c--observation__student-box=Candace" in the wrapper ".c--observation__student-box-container.enabled"

  Scenario: I can create an whole class observation with absent students
    When I click on the item with the selector ".toggle-accordion.o--header-link .environment-name" if ".toggle-accordion.o--header-link + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__inner .carat" if ".c--accordion-item__inner + .inner-container" is display none
    And I don't see a ".heatmap-report__graph h3"
    And I click on the item with the selector ".c--accordion-item__create-new-classroom"
    And Fill in the field with selector "#observationName" with the value "Test absent observation name"
    And Fill in the field with selector "#observationDescription" with the value "Short absent description"
    And I click on the item with the selector "#save-obs-name"
    And I click on the item with the selector ".c--observation__student-box=Brenda"
    And I click on the item with the selector ".c--observation__student-box=Elan"
    And I click on the item with the selector ".c--observation__student-box=Carlos"
    And I click on the item with the selector ".c--observation__student-box=Debra"
    And I see a ".c--observation__student-box=Brenda" in the wrapper ".c--observation__student-box-container.selected"
    And I see a ".c--observation__student-box=Elan" in the wrapper ".c--observation__student-box-container.selected"
    And I see a ".c--observation__student-box=Carlos" in the wrapper ".c--observation__student-box-container.selected"
    And I see a ".c--observation__student-box=Debra" in the wrapper ".c--observation__student-box-container.selected"
    And I don't see a ".c--observation__student-box=Candace" in the wrapper ".c--observation__student-box-container.selected"
    And I click on the item with the selector "#save-absent-students"
    And I click on the item with the selector ".enter-class=(7 - WC) Test absent observation name"
    # Check description
    And the field ".observation__description" has the text "Short absent description"
    # Check absent students
    And I see a ".c--observation__student-box=Brenda" in the wrapper ".c--observation__student-box-container:not(.enabled)"
    And I see a ".c--observation__student-box=Elan" in the wrapper ".c--observation__student-box-container:not(.enabled)"
    And I see a ".c--observation__student-box=Carlos" in the wrapper ".c--observation__student-box-container:not(.enabled)"
    And I see a ".c--observation__student-box=Debra" in the wrapper ".c--observation__student-box-container:not(.enabled)"
    # not absent
    And I see a ".c--observation__student-box=Candace" in the wrapper ".c--observation__student-box-container.enabled"
    And Fill in the field with selector ".observation__description" with the value "New description"
    And I click on the item with the selector "button[form='obs-desc-form']"
    And I click on the item with the selector "#obs-notes-form"
    And Fill in the field with selector ".observation__notes" with the value "New Notes"
    And I click on the item with the selector "button[form='obs-notes-form']"
    And I refresh the browser
    And I wait "2000" ms
    And the field ".observation__description" has the text "New description"
    And the field ".observation__notes" has the text "New Notes"
