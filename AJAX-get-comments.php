<? ini_set('display_errors',1); error_reporting(E_ALL); ?>

<?
header("Access-Control-Allow-Origin: *");
require_once "_mauth/microlib.php";
# Кому:
$addressee= txt_filter($_POST['addressee']);
//if ($addressee=='__system') $addressee= "У мене чудова новина!"; //звіт - мені
$key2= txt_filter($_POST['key']);

# Зчитуємо повідомлення:

$answer= [];

$mysqli = new mysqli("mysql.hostinger.com.ua", "u227975639_admin", "12345678", "u227975639_bd");

$result= $mysqli->query("SELECT * FROM `private_msg` WHERE `addressee`='$addressee' ORDER BY `id` DESC ");
while ($row = $result->fetch_assoc()) {
  $answer[]= ["author"=>$row["author"], "msg"=>$row["msg"], "new"=>$row["new"], "date_time"=>$row["date_time"]];//['author'=>$row["author"], 'msg'=>$row["msg"]);
}
$result->free();

$mysqli->query("UPDATE `private_msg` SET `new`='0' WHERE `addressee`='$addressee' ");

$mysqli->close();
//$answer[]= ["author"=>"anonymous", "msg"=>"-=|HELLO|=-"];
//$answer['cb']= $_GET['callback'];


# Відправляємо відповідь
//$answer['name'] = "response";


echo json_encode($answer);
//echo $_GET['callback']."(".json_encode($answer).");";



?>
