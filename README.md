<h1> GPIOGUI-server</h1>

A webserver for controlling GPIO pins

<h3>Installation and starting the server:</h3>

I packaged everything you will need including the node modules and the node executable into the gpioserver.tar.gz. 

To download the files to your home directory and run the program you can enter these commands in your terminal on your pi:

cd ~ <br>
wget https://raw.githubusercontent.com/evanmoring/GPIOGUI-server/master/GPIOGUI-server.tar.gz <br>
tar -xzvf GPIOGUI-server.tar.gz <br>
cd GPIOGUI-server <br>
./node server.js <br>

cd ~ takes you to your home folder. The wget command pulls the compressed archive off of github. The tar command unpacks the tar.gz file into your current directory. cd GPIOGUI-server navigates to the newly created folder. ./node server.js runs server.js with the program node which I included for your convenience.

When it is ready (<5 seconds for pi4, about 10 seconds for pi0), the console will say "listening on port 3000".

At this point you can navigate to this address in a web browser. If you are accessing the interface from the pi, you can navigate to 127.0.0.1:3000.. To navigate to the interface from another computer in your network, find your pi's ip address using ifconfig. Use that address with ":3000" added to the end.

I've tested the program on a pi0 and a pi4. If you have a different pi, let me know how it works!

Feel free to email me with any questions, suggestions, or comments.


