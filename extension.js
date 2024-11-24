const { St, Clutter } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const GLib = imports.gi.GLib;
const Lang = imports.lang;

// Event times
var EVENTS = [
    { label: "Breakfast", hour: 8, minute: 0 },
    { label: "Lunch", hour: 12, minute: 20 },
    { label: "At Home", hour: 17, minute: 30 },
    { label: "Dinner", hour: 19, minute: 0 },
    { label: "Bed", hour: 22, minute: 0 }
];

var fuzzyClockLabel;
var fuzzyClockContainer;
var intervalId;

function getFuzzyTime() {
    let now = GLib.DateTime.new_now_local();
    let currentHour = now.get_hour();
    let currentMinute = now.get_minute();

    let currentTimeInMinutes = currentHour * 60 + currentMinute;

    for (let event of EVENTS) {
        let eventTimeInMinutes = event.hour * 60 + event.minute;

        // Return the next event or the last event of the day
        if (currentTimeInMinutes <= eventTimeInMinutes) {
            return event.label;
        }
    }

    // Return the last event of the day
    return EVENTS[EVENTS.length - 1].label;
}

function setText() {
    let desiredText = getFuzzyTime();
    fuzzyClockLabel.set_text(desiredText);
}

function enable() {
    // Create the panel button
    fuzzyClockContainer = new PanelMenu.Button(0.0, "FuzzyClock", false);

    // Create the label
    fuzzyClockLabel = new St.Label({
        text: 'FuzzyClock',
        y_align: Clutter.ActorAlign.CENTER
    });

    // Add label to container
    fuzzyClockContainer.add_child(fuzzyClockLabel);

    // Add container to the panel
    Main.panel.addToStatusArea('fuzzy-clock', fuzzyClockContainer);

    // Set initial text
    setText();

    // Update every minute
    intervalId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
        setText();
        return true; // Repeat the timeout every minute
    });
}

function disable() {
    if (fuzzyClockContainer) {
        // Remove interval
        if (intervalId) {
            GLib.Source.remove(intervalId);
            intervalId = null;
        }

        // Destroy the container
        fuzzyClockContainer.destroy();
        fuzzyClockContainer = null;
        fuzzyClockLabel = null;
    }
}
