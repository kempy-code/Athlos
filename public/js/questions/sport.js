// =====================================
// ATHLOS TEAM SPORT MODULE
// public/js/questions/sport.js
// =====================================


export default [

    {
        id:"sport_name",

        title:"What sport do you play?",

        description:
        "Athlos will customise training around your sport's demands.",

        type:"text",

        placeholder:
        "Example: Football, Basketball, Rugby, Tennis",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Team Sport"

        }

    },





    {
        id:"sport_position",

        title:"What position or role do you play?",

        type:"text",

        placeholder:
        "Example: Midfielder, striker, guard, winger",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Team Sport"

        }

    },





    {
        id:"sport_level",

        title:"What level do you compete at?",

        type:"chips",

        options:[

            "School",

            "Club",

            "Regional",

            "State",

            "National",

            "Professional"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Team Sport"

        }

    },





    {
        id:"season_status",

        title:"What stage of your season are you currently in?",

        type:"chips",

        options:[

            "Off-season",

            "Pre-season",

            "In-season",

            "Competition Preparation"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Team Sport"

        }

    },





    {
        id:"team_training_days",

        title:"How many team sessions do you have each week?",

        type:"slider",

        min:0,

        max:7,

        default:2,

        unit:"sessions/week",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Team Sport"

        }

    },





    {
        id:"games_per_week",

        title:"How many games or competitions do you have per week?",

        type:"slider",

        min:0,

        max:5,

        default:1,

        unit:"games/week",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Team Sport"

        }

    },





    {
        id:"sport_focus",

        title:"What physical qualities do you want to improve?",

        description:
        "Select all areas that matter for your sport.",

        type:"chips",

        multiple:true,

        options:[

            "Speed",

            "Strength",

            "Endurance",

            "Agility",

            "Power",

            "Mobility",

            "Recovery"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Team Sport"

        }

    },





    {
        id:"sport_weakness",

        title:"What is your biggest weakness?",

        type:"chips",

        options:[

            "Fitness during games",

            "Speed",

            "Acceleration",

            "Strength",

            "Power",

            "Agility",

            "Recovery",

            "Confidence"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Team Sport"

        }

    },





    {
        id:"sport_training_history",

        title:"How long have you played this sport?",

        type:"chips",

        options:[

            "Less than 1 year",

            "1-3 years",

            "3-5 years",

            "5+ years"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Team Sport"

        }

    },





    {
        id:"sport_performance_goal",

        title:"What performance improvement are you chasing?",

        type:"text",

        multiline:true,

        placeholder:
        "Example: Become faster, last the whole match, improve explosiveness",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Team Sport"

        }

    }

];