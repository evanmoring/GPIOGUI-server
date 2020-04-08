# GPIOGUI-server

A webserver for controlling GPIO pins

Installation:

I packaged everything you will need including the node modules and the node executable into the gpioserver.tar.gz. 

To access it, download the file into a folder you want to use for the server. Unpack the file with the command:

tar -xzvf gpioserver.tar.gz

Starting the server:

Navigate to the folder where you unpacked the .tar.gz. Then use this command:

./node server.js

When it is ready (<5 seconds for pi4, about 10 seconds for pi0), the console will say "listening on port 3000".

At this point you can navigate to this address in a web browser. If you are accessing the interface from the pi, you can navigate to 127.0.0.1:3000.. To navigate to the interface from another computer in your network, find your pi's ip address using ifconfig. Use that address with ":3000" added to the end.

Feel free to email me with any questions, suggestions, or comments.


