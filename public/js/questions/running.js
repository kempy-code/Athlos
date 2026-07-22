// =====================================
// ATHLOS RUNNING MODULE
// public/js/questions/running.js
// =====================================


export default [

    {
        id:"running_experience",

        title:"How long have you been running?",

        description:
        "This helps Athlos choose the correct training progression.",

        type:"chips",

        options:[

            "Never",

            "Less than 3 months",

            "3-12 months",

            "1-3 years",

            "3+ years"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Running"

        }

    },





    {
        id:"runner_type",

        title:"What type of runner are you?",

        type:"chips",

        multiple:true,

        options:[

            "Sprinter (100m-400m)",

            "Middle Distance (800m-1500m)",

            "Long Distance (3km+)",

            "Trail Runner",

            "General Fitness"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Running"

        }

    },





    {
        id:"runs_per_week",

        title:"How many runs do you currently do each week?",

        type:"slider",

        min:0,

        max:14,

        default:3,

        unit:"runs/week",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Running"

        }

    },





    {
        id:"weekly_distance",

        title:"What is your current weekly running distance?",

        type:"number",

        placeholder:
        "Example: 25",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Running"

        }

    },





    {
        id:"longest_run",

        title:"What is your longest recent run?",

        type:"number",

        placeholder:
        "Distance in km",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Running"

        }

    },





    {
        id:"has_raced",

        title:"Have you raced before?",

        type:"toggle",

        options:[

            "Yes",

            "No"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Running"

        }

    },








    {
        id:"pb_100m",

        title:"What is your 100m personal best?",

        type:"text",

        placeholder:
        "Example: 13.4 seconds",

        condition:{

            question:"has_raced",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"pb_200m",

        title:"What is your 200m personal best?",

        type:"text",

        placeholder:
        "Example: 27.5 seconds",

        condition:{

            question:"has_raced",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"pb_400m",

        title:"What is your 400m personal best?",

        type:"text",

        placeholder:
        "Example: 1:02",

        condition:{

            question:"has_raced",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"pb_800m",

        title:"What is your 800m personal best?",

        type:"text",

        placeholder:
        "Example: 2:30",

        condition:{

            question:"has_raced",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"pb_1500m",

        title:"What is your 1500m personal best?",

        type:"text",

        placeholder:
        "Example: 5:00",

        condition:{

            question:"has_raced",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"pb_3km",

        title:"What is your 3km personal best?",

        type:"text",

        placeholder:
        "Example: 12:00",

        condition:{

            question:"has_raced",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"pb_5km",

        title:"What is your 5km personal best?",

        type:"text",

        placeholder:
        "Example: 22:00",

        condition:{

            question:"has_raced",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"pb_10km",

        title:"What is your 10km personal best?",

        type:"text",

        placeholder:
        "Example: 45:00",

        condition:{

            question:"has_raced",

            operator:"equals",

            value:"Yes"

        }

    },







    {
        id:"target_distance",

        title:"What distance are you training for?",

        type:"chips",

        options:[

            "100m",

            "200m",

            "400m",

            "800m",

            "1500m",

            "3km",

            "5km",

            "10km",

            "Half Marathon",

            "Marathon",

            "General Fitness"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Running"

        }

    },





    {
        id:"running_target",

        title:"What performance are you aiming for?",

        type:"text",

        multiline:true,

        placeholder:
        "Example: Run 5km under 20 minutes by October",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Running"

        }

    },





    {
        id:"running_sessions",

        title:"What training sessions do you currently use?",

        type:"chips",

        multiple:true,

        options:[

            "Easy Runs",

            "Tempo Runs",

            "Intervals",

            "Hill Runs",

            "Long Runs",

            "Race Practice"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Running"

        }

    },





    {
        id:"running_tracking",

        title:"How do you track your runs?",

        type:"chips",

        options:[

            "GPS Watch",

            "Heart Rate Monitor",

            "Pace Only",

            "Nothing"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Running"

        }

    },





    {
        id:"running_terrain",

        title:"Where do you prefer running?",

        type:"chips",

        options:[

            "Road",

            "Track",

            "Trail",

            "Treadmill"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Running"

        }

    }

];