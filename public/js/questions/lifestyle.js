// =====================================
// ATHLOS LIFESTYLE QUESTIONS
// public/js/questions/lifestyle.js
// =====================================


export default [

    {
        id:"training_days",

        title:"How many days per week can you train?",

        description:
        "Athlos will build your schedule around your availability.",

        type:"slider",

        min:1,

        max:7,

        default:3,

        unit:"days/week"

    },





    {
        id:"session_length",

        title:"How long can your training sessions usually be?",

        type:"chips",

        options:[

            "Under 30 minutes",

            "30-45 minutes",

            "45-60 minutes",

            "60-90 minutes",

            "90+ minutes"

        ]

    },





    {
        id:"available_days",

        title:"Which days can you train?",

        description:
        "Select all days you are normally available.",

        type:"chips",

        multiple:true,

        options:[

            "Monday",

            "Tuesday",

            "Wednesday",

            "Thursday",

            "Friday",

            "Saturday",

            "Sunday"

        ]

    },





    {
        id:"preferred_training_time",

        title:"When do you prefer training?",

        type:"chips",

        options:[

            "Morning",

            "Afternoon",

            "Evening",

            "No preference"

        ]

    },





    {
        id:"sleep_hours",

        title:"How much sleep do you usually get?",

        description:
        "Recovery is a key part of performance.",

        type:"chips",

        options:[

            "Less than 5 hours",

            "5-7 hours",

            "7-9 hours",

            "9+ hours"

        ]

    },





    {
        id:"stress_level",

        title:"What is your current stress level?",

        type:"slider",

        min:1,

        max:10,

        default:5,

        unit:"/10"

    },





    {
        id:"daily_activity",

        title:"How active are you outside training?",

        type:"chips",

        options:[

            "Mostly sitting",

            "Lightly active",

            "Active",

            "Very active"

        ]

    },





    {
        id:"school_workload",

        title:"How busy is your weekly schedule?",

        description:
        "This helps prevent unrealistic programs.",

        type:"chips",

        options:[

            "Low",

            "Moderate",

            "High",

            "Very high"

        ]

    }

];