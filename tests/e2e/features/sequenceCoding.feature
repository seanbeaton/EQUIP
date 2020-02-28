#@watch
Feature: Sequence coding and observations settings
  I can code sequences on an observation
  And I can change observations settings

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
    And I click on the item with the selector ".enter-class=(7 - WC) Test observation name"
    # First seq
    And I click on the item with the selector ".c--observation__student-box=Brenda"
    And I click on the item with the selector "label[for='student-talk--type-__explanation']"
    And I click on the item with the selector "label[for='student-talk--length-__extended-contribution']"
    And I click on the item with the selector "label[for='teacher-question--type-__explanation']"
    And I click on the item with the selector "label[for='teacher-wait-time__long']"
    And I click on the item with the selector "label[for='teacher-tone__enthusiastic']"
    And I click on the item with the selector "#save-seq-params"
    # Second seq
    And I click on the item with the selector ".c--observation__student-box=Elan"
    And I click on the item with the selector "label[for='student-talk--type-__procedural']"
    And I click on the item with the selector "label[for='student-talk--length-__brief-contribution']"
    And I click on the item with the selector "label[for='teacher-question--type-__procedural']"
    And I click on the item with the selector "label[for='teacher-wait-time__short']"
    And I click on the item with the selector "label[for='teacher-tone__neutral']"
    And I click on the item with the selector "#save-seq-params"
    # Verify it exists
    And I click on the item with the selector "#show-all-observations"
    And I wait "2000" ms
    And I see a ".contributions-modal-header=Brenda" in the wrapper "#data-modal-content .contributions-grid-container:nth-child(2)"
    And I see 2 ".contributions-grid-item=Explanation" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"
    And I see a ".contributions-grid-item=Extended Contribution" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"
    And I see a ".contributions-grid-item=Long" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"
    And I see a ".contributions-grid-item=Enthusiastic" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"
    # Verify the second one
    And I see a ".contributions-modal-header=Elan" in the wrapper "#data-modal-content .contributions-grid-container:nth-child(5)"
    And I see 2 ".contributions-grid-item=Procedural" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(7)"
    And I see a ".contributions-grid-item=Brief Contribution" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(7)"
    And I see a ".contributions-grid-item=Short" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(7)"
    And I see a ".contributions-grid-item=Neutral" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(7)"
    # Delete sequence (abort)
    And I click on the item with the selector ".delete-seq" in the wrapper "#data-modal-content .contributions-grid-container:nth-child(2)"
    And I dismiss the alert
    And I see a ".contributions-modal-header=Brenda" in the wrapper "#data-modal-content .contributions-grid-container:nth-child(2)"
    And I see 2 ".contributions-grid-item=Explanation" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"
    And I see a ".contributions-grid-item=Extended Contribution" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"
    And I see a ".contributions-grid-item=Long" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"
    And I see a ".contributions-grid-item=Enthusiastic" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"
    # Delete sequence (accept)
    And I click on the item with the selector ".delete-seq" in the wrapper "#data-modal-content .contributions-grid-container:nth-child(2)"
    And I confirm the alert
    And I don't see a ".contributions-modal-header=Brenda" in the wrapper "#data-modal-content .contributions-grid-container:nth-child(2)"

    # Edit sequence
    And I click on the item with the selector ".edit-seq" in the wrapper "#data-modal-content .contributions-grid-container:nth-child(2)"

    And I click on the item with the selector ".subj-box-params=Explanation" in the wrapper ".boxes-wrapper .c--modal-student-options-container:nth-child(2)"
    And I click on the item with the selector ".subj-box-params=Extended Contribution" in the wrapper ".boxes-wrapper .c--modal-student-options-container:nth-child(4)"
    And I click on the item with the selector ".subj-box-params=Explanation" in the wrapper ".boxes-wrapper .c--modal-student-options-container:nth-child(6)"
    And I click on the item with the selector ".subj-box-params=Long" in the wrapper ".boxes-wrapper .c--modal-student-options-container:nth-child(8)"
    And I click on the item with the selector ".subj-box-params=Enthusiastic" in the wrapper ".boxes-wrapper .c--modal-student-options-container:nth-child(10)"
    And I click on the item with the selector "#edit-seq-params"
    And I wait "1000" ms
    # Make sure it's changed
    And I see a ".contributions-modal-header=Elan" in the wrapper "#data-modal-content .contributions-grid-container:nth-child(2)"
    And I see 2 ".contributions-grid-item=Explanation" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"
    And I see a ".contributions-grid-item=Extended Contribution" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"
    And I see a ".contributions-grid-item=Long" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"
    And I see a ".contributions-grid-item=Enthusiastic" in the wrapper "#data-modal-content .contributions-grid-item-container:nth-child(4)"

  Scenario: I can change the observation date
    When I click on the item with the selector ".toggle-accordion.o--header-link .environment-name" if ".toggle-accordion.o--header-link + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__inner .carat" if ".c--accordion-item__inner + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__create-new-classroom"
    And Fill in the field with selector "#observationName" with the value "Test observation name"
    And Fill in the field with selector "#observationDescription" with the value "Short description"
    And I click on the item with the selector "#save-obs-name"
    And I click on the item with the selector "#save-absent-students"
    And I click on the item with the selector ".enter-class=(7 - WC) Test observation name"
    And I click on the item with the selector ".edit-observation-date"
    And Fill in the field with selector ".edit-obs-date" with the value "01/01/2020"
    And I click on the item with the selector ".save-observation-date"
    And I refresh the browser
    And I wait "2000" ms
    And I see a ".observation-date--display" with the text "01/01/2020"

  Scenario: I can change the observation name
    When I click on the item with the selector ".toggle-accordion.o--header-link .environment-name" if ".toggle-accordion.o--header-link + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__inner .carat" if ".c--accordion-item__inner + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__create-new-classroom"
    And Fill in the field with selector "#observationName" with the value "Test observation name"
    And Fill in the field with selector "#observationDescription" with the value "Short description"
    And I click on the item with the selector "#save-obs-name"
    And I click on the item with the selector "#save-absent-students"
    And I click on the item with the selector ".enter-class=(7 - WC) Test observation name"
    And I click on the item with the selector ".edit-observation-name"
    And Fill in the field with selector ".edit-obs-name" with the value "New observation name"
    And I click on the item with the selector ".save-observation-name"
    And I refresh the browser
    And I wait "2000" ms
    And I see a ".observation-name" with the text "New observation name"

  Scenario: I can change the absent students
    When I click on the item with the selector ".toggle-accordion.o--header-link .environment-name" if ".toggle-accordion.o--header-link + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__inner .carat" if ".c--accordion-item__inner + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__create-new-classroom"
    And Fill in the field with selector "#observationName" with the value "Test observation name"
    And Fill in the field with selector "#observationDescription" with the value "Short description"
    And I click on the item with the selector "#save-obs-name"
    And I click on the item with the selector "#save-absent-students"
    And I click on the item with the selector ".enter-class=(7 - WC) Test observation name"
    And I click on the item with the selector ".edit-included-students"
    And I see a ".observatory--edit"
    And I click on the item with the selector ".c--observation__student-box=Brenda"
    And I click on the item with the selector ".c--observation__student-box=Elan"
    And I click on the item with the selector ".edit-included-students"
    And I see a ".c--observation__student-box=Brenda" in the wrapper ".c--observation__student-box-container:not(.enabled)"
    And I see a ".c--observation__student-box=Elan" in the wrapper ".c--observation__student-box-container:not(.enabled)"
    And I see a ".c--observation__student-box=Carlos" in the wrapper ".c--observation__student-box-container.enabled"
    And I see a ".c--observation__student-box=Debra" in the wrapper ".c--observation__student-box-container.enabled"

  Scenario: I can delete an observation
    When I click on the item with the selector ".toggle-accordion.o--header-link .environment-name" if ".toggle-accordion.o--header-link + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__inner .carat" if ".c--accordion-item__inner + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__create-new-classroom"
    And Fill in the field with selector "#observationName" with the value "Test observation name"
    And Fill in the field with selector "#observationDescription" with the value "Short description"
    And I click on the item with the selector "#save-obs-name"
    And I click on the item with the selector "#save-absent-students"
    And I click on the item with the selector ".enter-class=(7 - WC) Test observation name"
    And I click on the item with the selector "#delete-observation"
    And I confirm the alert
    And I see a ".c--accordion-item_inner--count=Observations: 6"



