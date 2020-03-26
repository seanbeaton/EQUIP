import {console_log_conditional} from "/helpers/logging"

Template.faq.rendered = function() {
    const filterFaqSelectButton = document.querySelector(".js-faq__select");

    filterFaqSelectButton.addEventListener("click", () => {

    })
}




Template.faq.helpers({
  understandingFaq: function() {
      return [
          {
              header: "What is equity and why does it matter?",
              copy: "Equity is about fairness. It’s about making sure that every single student gets the opportunities they need in order to learn. In today’s classrooms, too many students don’t get a fair chance to learn, especially students of color, girls and women, students whose dominant language isn’t English, and students with learning differences. That’s not fair. <b>We can and should do better.</b>"
          },
          {
              header: "Where can inequities happen in classrooms?",
              copy: "Inequity in classrooms can take multiple forms. Students of color might be disciplined at disproportionate rates. In financially poor schools, there might not be enough textbooks for every student. Emergent multilingual students might not be allowed to use their home language in class. These are all pressing problems. <br><br> EQUIP is designed to analyze a particular equity issue: student participation. <b>Every student deserves a fair chance to participate.</b> Why does that matter? Research shows that classroom participation contributes to student learning. More than that, when students are seen by their classmates participating in whole-class discussions or in small group work, those students start to build identities as capable learners. <br><br> <b>That’s why it’s critical that teachers are aware of who is participating and how they get to participate.</b>"
          },
          {
              header: "How can implicit bias affect student participation?  ",
              copy: "Teachers have good intentions and want all of their students to participate. At the same time, teachers are also human beings with implicit biases and <a target='_blank' href='http://blindspot.fas.harvard.edu/'> blindspots</a>. Research tells us that without explicit monitoring, <b>people tend to unconsciously favor people who look like them, talk like them, and think like them. </b><br><br> Orchestrating a class discussion in a roomful of students is not an easy job. <b>How can a teacher be sure that their implicit biases are not influencing who they do and do not call on, or the kinds of questions they ask different students?</b> Teachers should not be blamed or made to feel guilty for their implicit biases. We all have them. Also, inequities in participation can be subtle and hard to notice. Teachers need tools to track participation patterns so they can become aware of implicit biases and and mitigate their impact."
          },
      ]
  },
  usingFaq: function() {
      return [
          {
              header: "What should I track with EQUIP?",
              copy: "EQUIP can be customized to track demographics and discourse dimensions that interest you. Here are some suggestions for getting started:<br><br><b>Demographics:</b> Many EQUIP users track social markers like race, gender, language proficiency, and special education status. Historically, these markers have been fault lines for inequity in schools. You might ask yourself: What social markers matter for equity at my school?<br><br> <b> Discourse Dimensions:</b> It’s common for EQUIP users to track the types of questions teachers ask, the length of student responses, and how much wait time teachers give students to think before responding. Again, you might ask yourself: What discourse dimensions matter for student learning? <br><br>Here’s a tip if you are new to EQUIP: <b>keep it simple.</b> Tracking too many things at once can be overwhelming. Instead, you might start with the simple stuff and later move to more nuanced aspects of participation."
          },
          {
              header: "I am a professional developer. How can I use EQUIP to support teachers?",
              copy: "EQUIP is designed for professional developers to collaborate with teachers. Ask the teachers you work with: <i> What social markers and discourse dimensions do you personally care about?</i> It’s also important to keep two things in mind. First, EQUIP analytics <b> don’t tell you everything about equity and inequity</b>. And second, <b>EQUIP does not tell teachers how to teach.</b> Teachers need space to reflect on EQUIP analytics alongside their professional knowledge of their students and teaching practice.<br><br>This simple, iterative process of analysis-reflection-change can be powerful: <ol style='margin-left: 50px;'><li>Collect data and generate EQUIP <b>analytics</b>.</li> <li> Open a space for teachers to <b>reflect</b> on the analytics.</li> <li>Discuss and implement <b>changes</b> to teaching practice.</li></ol> When supporting teachers with EQUIP, it is important to set reasonable expectations and to take a nonjudgmental stance. Research shows that inequities can arise in even the most experienced teachers’ classrooms. The goal is improvement, not perfection. "
          },
          {
            header: "Should I use EQUIP for teacher evaluation?",
            copy: "No, the purpose of EQUIP is not to sort “good” teachers from “bad” teachers. Instead, the goal is to support all teachers in making their classrooms more equitable for more students."
          },
          {
            header: "I am a researcher. What do I need to know about EQUIP?",
            copy: "EQUIP can be a powerful tool for research. Beyond the analytics that EQUIP generates, EQUIP data can be downloaded and analyzed using statistical packages like <i>R</i> and <i>SPSS</i>. <br><br>Keep in mind: While EQUIP’s quantitative analytics can reveal a great deal about equity patterns in classrooms, <b>numbers alone do not tell us everything about equity and inequity.</b> Quantitative analysis paired with qualitative analysis of students’ experiences and teachers’ perspectives can lead to even deeper insights."
          },
      ]
  },
  senseFaq: function() {
      return [
          {
              header: "What kinds of analytics does EQUIP generate?",
              copy: "EQUIP generates three levels of analytics (i.e., quantitative data and visualizations):<table class='c-faq-table'><tr><th colspan='1'>Type of Analytics</th><th colspan='1'>Description</th> </tr><tr><td>Overall Classroom-level Participation</td><td>A table of aggregate counts and % distributions for each discourse dimension.</td></tr><tr><td>Individual Student-level Participation</td><td>A histogram of the number of times each student in the class participated.</td></tr><tr><td>Demographic-level Participation </td><td>Bar charts showing equity ratios for each discourse dimensions disaggregated by social markers. </td></tr></table>"
          },
          {
              header: "What is an “equity ratio”?",
              copy: "EQUIP analytics provide the ratio of actual participation to expected participation. Actual participation is the actual number of times a discourse dimension occurs (e.g., the actual number of high-level questions asked by a teacher). Expected participation is the number of times we would expect a group of students to participate based on that group’s demographic representation in a particular classroom. <br><br> Equity ratios can be greater than one, less than one, or equal to one. Overall, equity ratios help account for the raw numbers of students from different demographic groups in a given classroom. <br><br> To illustrate how equity ratios are calculated and what they mean, imagine a classroom where <b>40% of students are women</b>:<table class='c-faq-table'><tr><th>Scenario</th><th>Actual Participation & Equity Ratio Calculation</th></tr><tr><td>Equity Ratio > 1</td><td><b>Actual Participation:</b> Of all of the high-level questions that were asked, 60% of those questions were asked of women in the class. <br><br><b>Equity Ratio:</b> 60 ➗40 = 1.5 <br><br><b>Interpretation:</b> Women in the class received a disproportionately higher share of high-level questions.</td></tr><tr><td>Equity Ratio < 1 </td><td><b>Actual Participation:</b>Of all of the high-level questions that were asked, 30% of those questions were asked of women in the class. <br><br><b>Equity Ratio:</b> 30 ➗40 = 0.75 <br><br><b>Interpretation:</b> Women in the class received a disproportionately <b>lower</b> share of high-level questions.</td></tr><tr><td>Equity Ratio = 1</td><td>Of all of the high-level questions that were asked, 40% of those questions were asked of women in the class.<br><br><b>Equity Ratio:</b>40 ➗40 = 1.0<br><br><b>Interpretation:</b>Women in the class received a proportional share of high-level questions.</td></tr></table>"
          },
          {
            header: "What equity ratios should I strive for?",
            copy: "Numbers never speak for themselves! They require interpretation, and different people might draw different conclusions from the same quantitative data. EQUIP does not specify “optimal” equity ratios. However, to increase equity in classrooms, teachers should at least aim for an equity ratio of 1 for students from groups historically marginalized in education (e.g., girls and women; Black, Latinx, and Native students)."
          },
          {
            header: "Should teachers share the results with their students?",
            copy: "Teachers should think carefully before deciding to share EQUIP analytics with their students. These are sensitive data and students could react negatively to seeing them. This might be something to discuss with parents and administrators beforehand."
          },
      ]
  },
  securityFaq: function() {
      return [
          { header: "How secure are my data?",
            copy: "EQUIP takes security and privacy issues very seriously. Your data are stored in a password protected database that only you can access with your username and password. Still, no computer security system is perfect. While unlikely, it is possible that a malicious third-party could access your data. See below on how to protect the identity of your students or school in the case of a potential security breach."},
          {
            header: "How do I protect the identity of my students or school?",
            copy: "EQUIP users might consider using students’ initials (instead of real names) and pseudonyms for classroom names (instead of a teacher’s real name). Then, even in the rare situation of a security breach, a third party would not be able to identify your students or school. See our Privacy Policy and Terms of Use for more information."},
          {
            header: "Do you share my data with anyone?",
            copy: "Your EQUIP data (e.g., classrooms, observations, analytics) are not shared with anyone. We may use data about EQUIP usage in the aggregate, for instance, to help us improve the app. See our Privacy Policy and Terms of Use for more information."
          },
          {
            header: "Does EQUIP record my classroom?",
            copy: "No, EQUIP does not video- or audio-record your classroom. EQUIP is a tool for tracking participation. The only data stored in EQUIP are the data you enter."
          },
          {
            header: "Should I backup my data?",
            copy: "It is important to backup your data regularly. You may use the export function (in data analysis) to save your coded contributions and student demographics. When you backup your data in this way, you may also use external software to conducting deeper analyses of your coded classrooms."
          }
      ]
  }
});

Template.faq.events({
  'click .toggle-accordion': function(e) {
      e.preventDefault();
      var ele = e.target;

      if (ele.nodeName === "H3") {
          ele = ele.parentElement;
      }

      $(ele).next().toggleClass('show');
      $(ele).next().slideToggle(350);
  },
  'change .js-faq__select': function(e) {
      const allSections =  document.querySelectorAll(".c-faq__inner");
      let faqName;
      switch(e.target.value) {
      case "understanding":
            faqName = "js-faq__understanding";
            [...allSections].forEach((section) => {
                if (section.classList.contains(faqName)) {
                    section.classList.remove("hide");
                } else {
                    section.classList.add("hide");
                }
            })
            break;
        case "using":
              faqName = "js-faq__using";
              [...allSections].forEach((section) => {
                  if (section.classList.contains(faqName)) {
                      section.classList.remove("hide");
                  } else {
                      section.classList.add("hide");
                  }
              })
              break;
      case "making":
            faqName = "js-faq__making";
            [...allSections].forEach((section) => {
                if (section.classList.contains(faqName)) {
                    section.classList.remove("hide");
                } else {
                    section.classList.add("hide");
                }
            })
            break;
        case "security":
              faqName= "js-faq__security";
              [...allSections].forEach((section) => {
                  if (section.classList.contains(faqName)) {
                      section.classList.remove("hide");
                  } else {
                      section.classList.add("hide");
                  }
              })
              break;
      default:
      [...allSections].forEach((section) => {
          section.classList.remove("hide");
      })
    }
  }
});
