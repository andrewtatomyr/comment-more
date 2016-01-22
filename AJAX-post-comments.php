<? ini_set('display_errors',1); error_reporting(E_ALL); ?>

<?
header("Access-Control-Allow-Origin: *");

require_once "_mauth/microlib.php";

# Кому:
$addressee= txt_filter($_POST['addressee']);
//if ($addressee=='__system') $addressee= "У мене чудова новина!"; //звіт - мені

# Від:
$author= txt_filter($_POST['author']);
$key1= txt_filter($_POST['key']);
# Повідомлення:
$msg= txt_filter($_POST['msg']);

# Записуємо повідомлення:
//...

//sto("msg/$addressee.txt" , $_POST['author'].": ".$_POST['msg']);
$mysqli = new mysqli("mysql.hostinger.com.ua", "u227975639_admin", "12345678", "u227975639_bd");

//
$result= $mysqli->query("SELECT `key1` FROM `private_msg` WHERE `author`='$addressee' AND `msg`='' ORDER BY  `id` ");
$row= $result->fetch_assoc();
$result->free();
if ( count($row)==0 ) {
  $key2= 0;
} else {
  $key2= $row["key1"];
}
//*/

$mysqli->query("INSERT INTO private_msg(`author`, `addressee`, `msg`, `key1`, `key2` ) VALUES ('$author', '$addressee', '$msg', '$key1', '$key2' ) ");

$mysqli->close();
# Відправляємо відповідь
//$answer['name'] = "response";


echo json_encode(["post"=>"ok"]);
//echo $_GET['callback']."(".json_encode($answer).");";



?>
