@watch
Feature: I can do some things on the site that will make it work hard

  Background:
    Given I am on the staging site
#    And a clean database
    And If I'm not logged in, I create an account with username prefix "testuser" and password "testpass"

  Scenario: I can use the Interactive Analytics
    Given I visit the "interactiveReport" page
    And I click on the item with the selector "#env_select_chosen"
    And I click on the item with the selector ".active-result=Example Classroom (shared)" in the wrapper "#env_select_chosen"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"

    And I click on the item with the selector "#disc_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#demo_select_chosen"

    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms

    And I click on the item with the selector "#disc_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#demo_select_chosen"
    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms

    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #3 - 9/13 (2018-09-13 - WC)"

    And I click on the item with the selector "#disc_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#demo_select_chosen"

    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms

    And I click on the item with the selector "#disc_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#demo_select_chosen"
    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms


  Scenario: I can use the Timeline Analytics
    Given I visit the "timelineReport" page
    And I click on the item with the selector "#env_select_chosen"
    And I click on the item with the selector ".active-result=Example Classroom (shared)" in the wrapper "#env_select_chosen"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"

    And I click on the item with the selector "#disc_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#demo_select_chosen"
    And I wait "1000" ms
    And I click on the item with the selector "#disc_opt_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_opt_select_chosen"

    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms

    And I click on the item with the selector "#disc_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#demo_select_chosen"
    And I wait "1000" ms
    And I click on the item with the selector "#disc_opt_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_opt_select_chosen"

    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms

    # all three
    And I click on the item with the selector ".vis-item-content=Observation #3 - 9/13 (2018-09-13 - WC)"

    And I click on the item with the selector "#disc_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#demo_select_chosen"
    And I wait "1000" ms
    And I click on the item with the selector "#disc_opt_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_opt_select_chosen"

    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms

    And I click on the item with the selector "#disc_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_select_chosen"
    And I click on the item with the selector "#demo_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#demo_select_chosen"
    And I wait "1000" ms
    And I click on the item with the selector "#disc_opt_select_chosen"
    And I click on a random item with the selector ".active-result" in the wrapper "#disc_opt_select_chosen"

    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms

  Scenario: I can use the Heatmap Analytics
    Given I visit the "heatmapReport" page
    And I click on the item with the selector "#env_select_chosen"
    And I click on the item with the selector ".active-result=Example Classroom (shared)" in the wrapper "#env_select_chosen"
    And I wait "2000" ms
    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"

    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms

    And I click on the item with the selector ".vis-item-content=Observation #3 - 9/13 (2018-09-13 - WC)"

    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms

    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"

    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms

    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"
    And I click on the item with the selector ".vis-item-content=Observation #2 - 9/6 (2018-09-06 - WC)"

    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms

    And I click on the item with the selector ".vis-item-content=Observation #1 - 9/4 (2018-09-04 - WC)"

    And I wait between "3500" and "7500" ms
    And I click on the item with the selector ".refresh-report"
    And I wait between "3500" and "7500" ms
