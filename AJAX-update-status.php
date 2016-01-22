<? ini_set('display_errors',1); error_reporting(E_ALL); ?>

<?
header("Access-Control-Allow-Origin: *");
require_once "_mauth/microlib.php";


$addressee= txt_filter($_POST['addressee']); //must be a __system
//if ($addressee=='__system') $addressee= "У мене чудова новина!"; //звіт - мені

$author= txt_filter($_POST['author']);

$version= $_POST['version'];

$ignore_set= str_replace("undefined","",$_POST['ignore_set']);


$mysqli = new mysqli("mysql.hostinger.com.ua", "u227975639_admin", "12345678", "u227975639_bd");

$mysqli->query("UPDATE `private_msg` SET `version`='$version', `ignore_set`='$ignore_set', `date_time`=NULL WHERE `addressee`='__system' AND `author`='$author' AND `msg`='' ");


$ignore_str= '';
$users_count= 0;
$result= $mysqli->query("SELECT `ignore_set`,`version` FROM `private_msg` WHERE `addressee`='__system' AND `msg`='' ");
while ($row = $result->fetch_assoc()) {
  //$answer[]= ["author"=>$row["author"], "msg"=>$row["msg"], "new"=>$row["new"]];//['author'=>$row["author"], 'msg'=>$row["msg"]);
  if ($row['ignore_set']) {
    $ignore_str.= $row['ignore_set'];
  }
  if ($row['version']<>NULL) {
    $users_count++;
  }
}
$result->free();

$mysqli->close();


$arr= explode( "<|>" , str_replace("][","]<|>[",$ignore_str) );
$tmp= $ignore_str;
$count_arr= [];
foreach ($arr as $key => $val) {
  if (substr_count( $tmp , $val )<>0) {
    $count_arr[$val]= round(substr_count( $tmp , $val )/$users_count*100);
    $tmp= str_replace($val,"",$tmp);
  }
}


//substr_count( "[$___]", $ignore_str );

$answer["ignored"]= $count_arr;
$answer["ignore_str"]= $ignore_str;
$answer["version"]= trim(rcl("dload/JMVersion.txt"));
$answer["changelog"]= rcl("dload/JMChangelog.txt");
# Відправляємо відповідь
echo json_encode($answer);

?>
