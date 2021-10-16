@echo off
set MODID=%3
set STEAMCMD="%1"
set SRVPATH="%2"
set MODPATH="%SRVPATH%\SquadGame\Plugins\Mods"
%STEAMCMD% +login anonymous +force_install_dir %SRVPATH% +app_update 403240 validate +workshop_download_item 393380 %MODID% +quit
@RD /S /Q "%MODPATH%\%MODID%"
mkdir "%MODPATH%\%MODID%"
echo a | xcopy /S "%SRVPATH%\steamapps\workshop\content\393380\%MODID%" "%MODPATH%\%MODID%"
