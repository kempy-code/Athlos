// =====================================
// ATHLOS GOAL QUESTIONS
// public/js/questions/goals.js
// =====================================


export default [

    {
        id:"primary_goal",

        title:"What is your main fitness goal?",

        description:
        "Athlos will customise your training path based on this.",

        type:"chips",

        options:[

            "Build Muscle",

            "Improve Running",

            "Improve Sports Performance",

            "Lose Fat",

            "Get Fitter",

            "Increase Strength",

            "Train For Event",

            "Hybrid Athlete"

        ]
    },





    {
        id:"goal_timeline",

        title:"How long do you want to work towards this goal?",

        type:"chips",

        options:[

            "4 weeks",

            "8 weeks",

            "12 weeks",

            "6 months",

            "Long term"

        ]
    },





    {
        id:"competition_goal",

        title:"Are you training for a specific event?",

        type:"toggle",

        options:[

            "Yes",

            "No"

        ]
    },





    {
        id:"event_name",

        title:"What event are you preparing for?",

        description:
        "Examples: 5km race, football season, athletics carnival.",

        type:"text",

        placeholder:
        "Enter event name",


        condition:{

            question:"competition_goal",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"event_date",

        title:"When is your event?",

        type:"text",

        placeholder:
        "Example: 15 August 2026",


        condition:{

            question:"competition_goal",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"performance_target",

        title:"What performance are you aiming for?",

        description:
        "Example: Run 5km under 20 minutes.",

        type:"text",

        placeholder:
        "Describe your target",


        condition:{

            question:"competition_goal",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"training_type",

        title:"What type of training do you want to focus on?",

        description:
        "This selects the personalised Athlos modules.",

        type:"chips",

        options:[

            "Running",

            "Gym",

            "Team Sport",

            "Hybrid"

        ]

    }

];