//* importazione react x icone fontawesome
import React from 'react';

//* funzione per calcolare la rappresentazione delle stelle
export function getStarRatingIcons(voteAverage) {
    // siccome i voti sono su scala 0-10, li divido per due e arrotondo per eccesso
    const scaledVote = (voteAverage / 2);
    const fullStars = Math.ceil(scaledVote);
    // creo array vuoto per contenere le stelle
    const starIcons = [];

    // ciclo per aggiungere le stelle piene
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starIcons.push(<i key={'star-full-' + i} className="fa-solid fa-star  star-icon"></i>); // Stella piena
        } else {
            starIcons.push(<i key={'star-empty-' + (fullStars + i)} className="fa-regular fa-star  star-icon"></i>); // Stella vuota
        }
        
    }

    return starIcons;
}