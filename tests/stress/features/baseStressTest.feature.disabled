#@watch
Feature: I can do some things on the site that will make it work hard

  Background:
    Given I am on the staging site
    And If I'm not logged in, I create an account with username prefix "testuser" and password "testpass"

  Scenario: I can create an example classroom, delete it, then create my own
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
    And I pause like a human
    And I click on the item with the selector "#env-delete"
    And I confirm the alert

    # Create env
    When I click on the item with the selector "#env-create-button"
    And Fill in the field with selector "#env-create-modal #environmentName" with the value "Test Environment"
    And I click on the item with the selector "#save-env-name"
    Then A classroom exists with the name "Test Environment"
    And I pause like a human

    # Add demos
    When I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    And I click on the item with the selector ".c-dashboard__accordion > .environment:first-child #edit-class-params"
    And I click on the item with the selector "#load-default-demo"
    And I pause like a human
    And the ".help-icon" is removed
    And I click on the item with the selector "#save-demo-params"
    And I visit the "environmentList" page
    And the ".help-icon" is removed
    And the "#toast-container" is removed
    And I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    Then I see a ".demographic-labels" with the text "Race, Gender"

    # Add disc params
    Given I visit the "environmentList" page
    And the ".help-icon" is removed
    When I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    And I click on the item with the selector ".c-dashboard__accordion > .environment:first-child #edit-sequence-params"
    And I click on the item with the selector "#load-default-seq"
    And I pause like a human
    And the ".help-icon" is removed
    And the "#toast-container" is removed
    And I click on the item with the selector "#save-seq-params"
    And the "#toast-container" is removed
    And I visit the "environmentList" page
    And the ".help-icon" is removed
    And I click on the item with the selector ".toggle-accordion .environment-name" if ".toggle-accordion + .inner-container" is display none
    Then I see a ".discourse-labels" with the text "Teacher Solicitation, Wait Time, Solicitation Method, Length of Talk, Student Talk"

    # Add Students

    Then I quickly pause like a human
    And I click on the item with the selector ".c-dashboard__accordion > .environment:first-child #edit-class-studs"
    Then I quickly pause like a human

    And I create a student named "Han" with the demographics "Race": "Asian" and "Gender": "Girl"
    Then a student named "Han" with the demographics "Race": "Asian" and "Gender": "Girl" exists on the student page
    Then I quickly pause like a human

    And I create a student named "Elan" with the demographics "Race": "White" and "Gender": "Boy"
    Then a student named "Elan" with the demographics "Race": "White" and "Gender": "Boy" exists on the student page
    Then I quickly pause like a human

    And I create a student named "Brenda" with the demographics "Race": "White" and "Gender": "Girl"
    Then a student named "Brenda" with the demographics "Race": "White" and "Gender": "Girl" exists on the student page

    Then I quickly pause like a human
    And I create a student named "Shawn" with the demographics "Race": "Black" and "Gender": "Boy"
    Then a student named "Shawn" with the demographics "Race": "Black" and "Gender": "Boy" exists on the student page

    And I visit the "environmentList" page

    When I click on the item with the selector ".toggle-accordion.o--header-link .environment-name" if ".toggle-accordion.o--header-link + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__inner .carat" if ".c--accordion-item__inner + .inner-container" is display none
    And I click on the item with the selector ".c--accordion-item__create-new-classroom"
    And Fill in the field with selector "#observationName" with the value "Test observation name"
    And Fill in the field with selector "#observationDescription" with the value "Short description"
    And I pause like a human
    And I click on the item with the selector "#save-obs-name"
    And I confirm the alert
    And I quickly pause like a human
    And I click on the item with the selector "#save-absent-students"
    And I click on the item with the selector ".enter-class=(1 - WC) Test observation name"
    # First seq
    And I pause like a human
    And I click on the item with the selector ".c--observation__student-box=Brenda"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--type-__explanation']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--length-__extended-contribution']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-question--type-__explanation']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-wait-time__long']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-tone__enthusiastic']"
    And I really quickly pause like a human
    And I click on the item with the selector "#save-seq-params"
    # Second seq
    And I pause like a human
    And I click on the item with the selector ".c--observation__student-box=Elan"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--length-__brief-contribution']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-question--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-wait-time__short']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-tone__neutral']"
    And I really quickly pause like a human
    And I click on the item with the selector "#save-seq-params"
    # Verify it exists
    And I click on the item with the selector "#show-all-observations"
    And I quickly pause like a human
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

    # 8 More sequences

    And I click on the item with the selector ".modal-close"

    And I pause like a human
    And I click on the item with the selector ".c--observation__student-box=Shawn"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--length-__long-contribution']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-question--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-wait-time__long']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-tone__dismissive']"
    And I really quickly pause like a human
    And I click on the item with the selector "#save-seq-params"

    And I pause like a human
    And I click on the item with the selector ".c--observation__student-box=Han"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--length-__long-contribution']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-question--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-wait-time__long']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-tone__dismissive']"
    And I really quickly pause like a human
    And I click on the item with the selector "#save-seq-params"

    And I pause like a human
    And I click on the item with the selector ".c--observation__student-box=Shawn"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--length-__long-contribution']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-question--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-wait-time__long']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-tone__dismissive']"
    And I really quickly pause like a human
    And I click on the item with the selector "#save-seq-params"

    And I pause like a human
    And I click on the item with the selector ".c--observation__student-box=Han"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--length-__long-contribution']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-question--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-wait-time__long']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-tone__dismissive']"
    And I really quickly pause like a human
    And I click on the item with the selector "#save-seq-params"

    And I pause like a human
    And I click on the item with the selector ".c--observation__student-box=Shawn"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--length-__long-contribution']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-question--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-wait-time__long']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-tone__dismissive']"
    And I really quickly pause like a human
    And I click on the item with the selector "#save-seq-params"

    And I pause like a human
    And I click on the item with the selector ".c--observation__student-box=Han"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--length-__long-contribution']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-question--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-wait-time__long']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-tone__dismissive']"
    And I really quickly pause like a human
    And I click on the item with the selector "#save-seq-params"

    And I pause like a human
    And I click on the item with the selector ".c--observation__student-box=Shawn"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--length-__long-contribution']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-question--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-wait-time__long']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-tone__dismissive']"
    And I really quickly pause like a human
    And I click on the item with the selector "#save-seq-params"

    And I pause like a human
    And I click on the item with the selector ".c--observation__student-box=Han"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='student-talk--length-__long-contribution']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-question--type-__procedural']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-wait-time__long']"
    And I really quickly pause like a human
    And I click on the item with the selector "label[for='teacher-tone__dismissive']"
    And I really quickly pause like a human
    And I click on the item with the selector "#save-seq-params"

