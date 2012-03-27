/*global gstime: true */
/*jslint vars: true */ //why isn't this working
// -----------------------------------------------------------------------------
//
//                            procedure initl
//
//   this procedure initializes the spg4 propagator. all the initialization is
//     consolidated here instead of having multiple loops inside other routines.
//
// Author:
//   Jeff Beck
//   beckja@alumni.lehigh.edu
//   1.0 (aug 7, 2006) - update for paper dav
//   1.1 nov 16, 2007 - update for better compliance
// original comments from Vallado C++ version:
//   author        : david vallado                  719-573-2600   28 jun 2005
//
//   inputs        :
//     ecco        - eccentricity                           0.0 - 1.0
//     epoch       - epoch time in days from jan 0, 1950. 0 hr
//     inclo       - inclination of satellite
//     no          - mean motion of satellite
//     satn        - satellite number
//
//   outputs       :
//     ainv        - 1.0 / a
//     ao          - semi major axis
//     con41       -
//     con42       - 1.0 - 5.0 cos(i)
//     cosio       - cosine of inclination
//     cosio2      - cosio squared
//     einv        - 1.0 / e
//     eccsq       - eccentricity squared
//     method      - flag for deep space                    'd', 'n'
//     omeosq      - 1.0 - ecco * ecco
//     posq        - semi-parameter squared
//     rp          - radius of perigee
//     rteosq      - square root of (1.0 - ecco*ecco)
//     sinio       - sine of inclination
//     gsto        - gst at time of observation               rad
//     no          - mean motion of satellite
//
//   locals        :
//     ak          -
//     d1          -
//     del         -
//     adel        -
//     po          -
//
//   coupling      :
//     gstime      - find greenwich sidereal time from the julian date
//
//   references    :
//     hoots, roehrich, norad spacetrack report #3 1980
//     hoots, norad spacetrack report #6 1986
//     hoots, schumacher and glover 2004
//     vallado, crawford, hujsak, kelso  2006
//  ----------------------------------------------------------------------------*/

function initl(ecco, epoch, inclo, no, satn) {
    // /* -------------------- wgs-72 earth constants ----------------- */
    // sgp4fix identify constants and allow alternate values

    //TODO:
    //global tumin mu radiusearthkm xke j2 j3 j4 j3oj2
    // not used: tumin, mu, radiusearth, j3, j4, j3oj2
    var xke, j2;                // TODO: get them from GLOBAL or getgravc.js()

    //TODO:
    //global opsmode
    var opsmode;                // TODO: global opsmode (see testmat()?)

    var x2o3   = 2.0 / 3.0,
        // /* ------------- calculate auxillary epoch quantities ---------- */
        eccsq  = ecco * ecco,
        omeosq = 1.0 - eccsq,
        rteosq = Math.sqrt(omeosq),
        cosio  = Math.cos(inclo),
        cosio2 = cosio * cosio,
        // /* ------------------ un-kozai the mean motion ----------------- */
        ak    = Math.pow(xke / no, x2o3),
        d1    = 0.75 * j2 * (3.0 * cosio2 - 1.0) / (rteosq * omeosq),
        del   = d1 / (ak * ak),
        adel  = ak * (1.0 - del * del - del *
                   (1.0 / 3.0 + 134.0 * del * del / 81.0)),
        // defined elsewhere
        ao, sinio, po, con42, con41, ainv, einv, posq, rp, method,
        gsto, ts70, ids70, tfrac, c1, thgr70, fk5r, twopi, c1p2p;

    del   = d1 / (adel * adel);
    no    = no / (1.0 + del);

    ao    = Math.pow(xke / no, x2o3);
    sinio = Math.sin(inclo);
    po    = ao * omeosq;
    con42 = 1.0 - 5.0 * cosio2;
    con41 = -con42 - cosio2 - cosio2;
    ainv  = 1.0 / ao;
    einv  = 1.0 / ecco;
    posq  = po * po;
    rp    = ao * (1.0 - ecco);
    method = 'n';

    // sgp4fix modern approach to finding sidereal time
    if  (opsmode !== 'a') {
        gsto = gstime(epoch + 2433281.5); // EXTERNAL gstime()
    }
    else {
        // sgp4fix use old way of finding gst
        // count integer number of days from 0 jan 1970
        ts70   = epoch - 7305.0;
        ids70  = Math.floor(ts70 + 1.0e-8);
        tfrac  = ts70 - ids70;
        // find greenwich location at epoch
        c1     = 1.72027916940703639e-2;
        thgr70 = 1.7321343856509374;
        fk5r   = 5.07551419432269442e-15;
        twopi  = 6.283185307179586;
        c1p2p  = c1 + twopi;
        gsto   = (thgr70 + c1 * ids70 + c1p2p * tfrac + ts70 * ts70 * fk5r) % twopi;
    }

    if (gsto < 0.0) {
        gsto = gsto + twopi;
    }

    //TODO:
    // global idebug dbgfile
    // if isempty(idebug) {
    //     idebug = 0;
    // }
    // elseif (idebug) {
    //     debug5;
    // }

    return [ainv, ao, con41, con42, cosio, cosio2, einv,
            eccsq, method, omeosq, posq, rp, rteosq, sinio,
            gsto, no];
}