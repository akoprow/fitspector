// ------------------------------------------- Custom page JS ------------------------------------------
function selectPledge(num) {
  $('input:radio[name=pledgeLevel]')[num-1].checked = true;
  for (var i = 1; i <= 5; i++) {
    $('.pledge.level' + i).removeClass('alert-success').addClass('alert-warning');
  }
  $('.pledge.level' + num).addClass('alert-success');
};

$(document).ready(function() {
  var now = new Date();
  var end = Date.parse('September 8, 2013');
  var daysleft = Math.floor((end - now) / 1000 / 60 / 60 / 24);
  $('#daysleft').text(daysleft);
});

$(document).ready(function() {
  $('.goToNewsletter').on('click', function() {
    var props = { scrollTop: $('#mce-EMAIL-alert').offset().top - ($(window).height()/2) };
    var options = {
      duration: 1000
    };
    $('html, body').animate(props, options);
    return false;
  });
});

// ------------------------------------------ Google Analytics -----------------------------------------
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-267768-13']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
 (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
 m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-267768-13', 'fitspector.com');
ga('send', 'pageview');
