<?php
/*
Copyright (c) 2013 by Shin.  All Rights Reserved.
*/

unset($_REQUEST['_']);

$url = 'http://www.taigame.vn/?' . @http_build_query($_REQUEST);
$hash = md5($url);
header("Content-type: text/json; charset=utf-8");

if(file_exists('cache/' . $hash)){
    $content = @file_get_contents('cache/' . $hash);
}

if(empty($content)){
    $content = @file_get_contents($url);
    @file_put_contents('cache/' . $hash, $content);
}


echo $content;
die(1);
