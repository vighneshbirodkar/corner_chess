<!DOCTYPE html>
<html>
<head>
    <?php $base = "../../" ?>
    <base href="../../">
    <script src="js/jquery-2.2.4.min.js"></script>
    <script src="js/facebox.js"></script>
    <script src="js/gameSettings.js"></script>
    <link rel="stylesheet" type="text/css" href="css/facebox.css"/>
    <link rel="stylesheet" type="text/css" href="css/main.css"/>
    <link rel="stylesheet" type="text/css" href="css/bootstrap.css"/>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            $('a[rel*=facebox]').facebox()
        })
    </script>
</head>
<body>
<div class="container">
    <?php include $base."header.php"; ?>
    <nav>
        <ul>
        <li><a href="">Home</a></li>
        </ul>
        <li><a href="games/empty">Empty Template</a></li>
	<li><a href="games/multiplayer-snake/">Snake</a></li>
        <!--?php include $base."leftMenuGame.php"; ?-->
    </nav>
    <article>
        <h1 id="gameName"></h1>
        <h3 id="groupName"></h3>
        <h3>Instructions:</h3>
        <div id="gameDesc" class="well">
	  <ul>
	    <li>Choose a corner chess board of any size.</li>
	    <li>Both players initially place their kings in the board.</li>
	    <li>Then proceed to play using normal chess rules.</li>
	  </ul>
        </div>
        <form id="gameSettings" class="well">
        </form>
        <iframe src="games/corner_chess/iframe.html" class="game" width="800px" height="800px"></iframe>
    </article>
    <?php include $base."footer.php"; ?>
</div>
<script type="text/javascript">
    newWindowBtn(800,800,"games/corner_chess/iframe.html", []);
</script>
</body>
</html>
