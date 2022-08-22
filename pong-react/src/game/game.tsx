import React, { useEffect, useRef } from "react";
import './game.css';
import io, { Socket } from 'socket.io-client';
import paddle from "./paddle";
import ball from "./data";
import { JoinRoom } from "./components/Joinroom";

export const socket = io('http://10.11.13.10:3001'); //update this to mac pubic ip
let {ballObj} = ball;

function Game () {    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    let newPlayer: boolean = false;
    let rightPaddle: any = {};
    let leftPaddle: any = {};

    
    useEffect(() => {
        const renderCanvas = () => {
            const canvasBG = canvasRef.current;
            const ctxBG = canvasBG?.getContext('2d');
            const bg = new Image();
            bg.src = 'splash_art01.png';
            bg.onload = function()
            {
                ctxBG?.drawImage(bg, 0, 0, canvasBG!.width, canvasBG!.height);
            }
        }
        
        socket.on('player2_update', data => 
        {
            rightPaddle = data;
            newPlayer = true;
            
        });

        socket.on('player1_update', data => {
            leftPaddle = data;
        })
        socket.on('PlayerDisconnected', () =>
        {
            console.log('player2 out');
            newPlayer = false;

        });

        const renderPaddle = () => {
            const paddleC = canvasRef.current;
            const ctx = paddleC?.getContext('2d');
            paddle(ctx, paddleC, leftPaddle);
            if (newPlayer)
            {
                paddle(ctx, paddleC, rightPaddle);
            }
        }

        const drawBall = () => {
            socket.on('ball_update', data => {
                ballObj = data;
                const ballC = canvasRef.current;
                const ctx = ballC?.getContext('2d');
                ctx?.beginPath();
                ctx?.arc(ballObj.x, ballObj.y, ballObj.rad, 0, Math.PI * 2, false);
                ctx!.fillStyle = '#ffffff';
                ctx!.strokeStyle = '#000000';
                ctx?.fill();
                ctx?.stroke();
                ctx?.closePath();
            });
        }
        
        const render = () => {
            api_updates();
            renderCanvas();
            renderPaddle();
            drawBall();
            requestAnimationFrame(render);
        };

        canvasRef.current?.focus();
        render();
        
    }, []);
    
    
    const keyboardevent = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
        if (e.key === "ArrowUp") {
            socket.emit('arrow_keyUP');
            console.log('up');
        } 
        else if (e.key === "ArrowDown") {
            socket.emit('arrow_keyDown');
            console.log('down');
        }
    }
    function api_updates()
    {
        socket.emit('ball_init', ballObj);
        socket.emit('update');
    }
    return (
        <>
        <JoinRoom />
            <canvas id="game" ref={canvasRef}
            tabIndex={0}
            onKeyDown={keyboardevent}
            width="1280" height="720"></canvas>
        </>
            );
    }
export default Game;

