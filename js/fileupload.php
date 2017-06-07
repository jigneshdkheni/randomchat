 <?php

     $target_dir = "../upload/";
     $name = md5(time()).$_FILES["file"]["name"];
     $target_file = $target_dir . basename($name);

     $array = explode('.', $_FILES['file']['name']);
     $extension = strtolower(end($array));

     
     
     /*if($extension == 'jpg' || $extension == 'jpeg' || $extension == 'png' || $extension == 'gif')
     {*/
         if(move_uploaded_file($_FILES["file"]["tmp_name"], $target_file))
         {
               $response = array(
                  'status'=>'1',
                  'data'=>$name
               );
         }
         else
         {
               $response = array(
                  'status'=>'0',
                  'error'=>'not upload'
               );
         }
     /*}
     else
     {   
         $response = array(
            'status'=>'0',
            'error'=>'file not valid'
         );
     }*/

     echo json_encode($response);
?>