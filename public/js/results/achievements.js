export function renderAchievements(

container,

achievements=[],

milestones=[]

){


if(!container){

return;

}




container.innerHTML = `


<div class="dashboard-section">


<div class="section-header">

<h2>
Progress & Achievements
</h2>

<p>
Track your journey
</p>

</div>



<h3>
Program Milestones
</h3>


<div class="milestone-grid">


${
milestones.map(m=>`

<div class="milestone-card">


<strong>
Week ${m.week}
</strong>


<h4>
${m.goal}
</h4>


<p>
${m.measurement}
</p>


<span>
Target: ${m.target}
</span>


</div>


`).join("")

}



</div>





<h3>
Achievements
</h3>


<div class="achievement-grid">


${
achievements.map(a=>`

<div class="achievement-card">


<div class="achievement-icon">

🏆

</div>


<h4>

${a.name}

</h4>


<p>

${a.description}

</p>


<span>

${a.requirement}

</span>


</div>


`).join("")

}


</div>


</div>


`;



}