/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.95335820895522, "KoPercent": 0.04664179104477612};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7337514092446449, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.48297213622291024, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.999379652605459, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5638297872340425, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9990746452806909, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5098039215686274, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5061576354679803, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7199272967614012, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.34563758389261745, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.49019607843137253, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.932649134060295, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7193995381062356, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7189672293942403, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.37210982658959535, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5038759689922481, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9827267119062307, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8193196405648266, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9987445072190835, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.32362673726009267, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5038860103626943, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.4015804597701149, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.31, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.3013698630136986, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8531770512029612, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9977945809703844, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9969154842689698, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.29141104294478526, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 27872, 13, 0.04664179104477612, 866.6865312858828, 0, 60005, 185.0, 2192.700000000019, 4583.600000000006, 10850.930000000011, 7.287182225048224, 372.57609058904876, 87.45468005148572], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1615, 12, 0.7430340557275542, 969.0829721362229, 444, 2332, 928.0, 1247.8000000000002, 1390.3999999999996, 1653.6799999999978, 0.45317635940280615, 71.42250860070504, 26.339904461426556], "isController": true}, {"data": ["2.5 Select patient", 1612, 0, 0.0, 110.89081885856076, 64, 819, 89.0, 179.0, 240.0, 339.8699999999999, 0.4538264012664347, 11.854822204199218, 5.081041255163613], "isController": false}, {"data": ["7.1 Full name search", 141, 0, 0.0, 1493.8510638297876, 234, 18613, 595.0, 3922.3999999999996, 6221.500000000002, 14903.98000000011, 0.04051293396966415, 1.622167237247764, 0.4604036352456779], "isController": false}, {"data": ["2.3 Search by first/last name", 1621, 0, 0.0, 105.29919802590997, 67, 574, 88.0, 157.0, 196.0, 306.2399999999998, 0.4541613620470154, 14.20269092139212, 5.205762065902568], "isController": false}, {"data": ["4.0 Vaccination for flu", 408, 0, 0.0, 758.144607843137, 195, 1521, 718.5, 1019.9000000000002, 1119.1999999999998, 1428.2899999999995, 0.11653407107778592, 6.098560042859118, 5.048098520720644], "isController": true}, {"data": ["4.0 Vaccination for hpv", 406, 0, 0.0, 767.9556650246302, 195, 1975, 726.0, 995.0, 1136.6, 1564.0600000000009, 0.11648103338759552, 5.668520418859772, 5.048337309007685], "isController": true}, {"data": ["1.2 Sign-in page", 3026, 0, 0.0, 1375.272306675483, 13, 23560, 172.0, 4395.500000000003, 9893.250000000002, 11149.990000000002, 0.8390292215633283, 54.793209118935444, 11.159004923231322], "isController": false}, {"data": ["7.2 First name search", 149, 0, 0.0, 2690.2281879194634, 239, 17574, 861.0, 7065.0, 8604.5, 14341.5, 0.04233333380686056, 5.73552247484505, 0.48076756602508464], "isController": false}, {"data": ["7.7 Due vaccination search", 153, 0, 0.0, 818.7124183006538, 638, 8087, 715.0, 1009.2, 1098.3999999999996, 4735.220000000049, 0.044134267402891635, 5.915500327455351, 0.5101331660473927], "isController": false}, {"data": ["2.4 Patient attending session", 1559, 12, 0.7697241821680565, 385.5586914688899, 65, 1406, 346.0, 532.0, 633.0, 908.6000000000004, 0.437512593571287, 14.12932403471153, 5.924494769774082], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 3031, 0, 0.0, 1375.9729462223686, 39, 15830, 178.0, 4303.000000000003, 9740.400000000003, 11207.36, 0.8413076213144217, 65.39924098252018, 11.176835980056763], "isController": false}, {"data": ["1.3 Sign-in", 3021, 0, 0.0, 1383.5008275405519, 65, 28090, 195.0, 4164.600000000001, 9717.500000000002, 11198.820000000014, 0.839579459901118, 55.10232526651993, 11.490574391350053], "isController": false}, {"data": ["Run some searches", 1384, 1, 0.07225433526011561, 3033.6748554913224, 142, 60005, 1310.0, 10048.0, 10725.5, 12275.50000000003, 0.3872347938296486, 45.751486396489256, 4.440855861465913], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 387, 0, 0.0, 770.2583979328168, 196, 1662, 724.0, 998.2, 1230.599999999999, 1365.16, 0.11226245395281323, 5.58666359350012, 4.882667741354848], "isController": true}, {"data": ["2.1 Open session", 1621, 0, 0.0, 255.70388648982157, 122, 1586, 227.0, 386.39999999999986, 452.0, 642.78, 0.45432989563585446, 10.159010131630247, 5.089579866504508], "isController": false}, {"data": ["4.3 Vaccination confirm", 1558, 0, 0.0, 508.6161745827983, 345, 1730, 457.5, 692.0, 808.1499999999999, 1084.5600000000013, 0.4498560633840841, 9.604275195855578, 7.146127133243151], "isController": false}, {"data": ["4.1 Vaccination questions", 1593, 0, 0.0, 138.48713119899557, 85, 830, 112.0, 214.60000000000014, 280.0, 422.1199999999999, 0.4538100817627317, 6.339277536771293, 6.424746393021751], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 36.0, 36, 36, 36.0, 36.0, 36.0, 36.0, 27.777777777777775, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3022, 0, 0.0, 4364.21343481138, 265, 57502, 930.0, 12431.30000000001, 29763.54999999999, 33037.27, 0.8398384686593238, 212.42443785605246, 38.859434350762065], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 386, 0, 0.0, 752.5284974093257, 184, 1949, 706.0, 956.5, 1117.0499999999993, 1456.1499999999996, 0.11132061432828969, 5.922903656730774, 4.837238708383826], "isController": true}, {"data": ["7.0 Open Children Search", 1392, 0, 0.0, 2825.541666666665, 80, 20591, 1250.0, 9840.0, 10661.15, 11897.21, 0.38810827328621755, 44.608425825472416, 4.3454628117970415], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 50.0, 50, 50, 50.0, 50.0, 50.0, 50.0, 20.0, 5.7421875, 12.34375], "isController": false}, {"data": ["7.8 Year group search", 170, 0, 0.0, 3368.735294117644, 2983, 5505, 3238.5, 3792.7, 4304.7, 5365.129999999998, 0.05222487169577845, 7.20744030082755, 0.6056741094276953], "isController": false}, {"data": ["7.9 DOB search", 150, 0, 0.0, 1679.486666666666, 1173, 4004, 1421.5, 2616.2, 3175.7999999999997, 3943.820000000001, 0.043485571487380484, 5.975297738007404, 0.5009059380816195], "isController": false}, {"data": ["7.4 Partial name search", 146, 0, 0.0, 3979.082191780823, 233, 14847, 2736.0, 10929.5, 12440.500000000002, 14792.48, 0.042218043471283204, 5.691853484972979, 0.47944492517068665], "isController": false}, {"data": ["Debug Sampler", 1621, 0, 0.0, 0.3269586674892037, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.4541833763280521, 2.6181951777759473, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1621, 0, 0.0, 453.31400370141864, 322, 1488, 394.0, 616.8, 683.8999999999999, 909.5799999999997, 0.4541001659244468, 37.525347695826845, 5.083665233001568], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1587, 0, 0.0, 124.29363579080022, 75, 1349, 101.0, 189.4000000000001, 247.0, 364.71999999999935, 0.45311294589654405, 7.272507839539201, 6.183691779929438], "isController": false}, {"data": ["7.5 Needs Consent search", 141, 1, 0.7092198581560284, 11204.085106382989, 9357, 60005, 10491.0, 11351.4, 11703.6, 59671.52000000001, 0.04115610715766, 5.608405523747949, 0.4734540030334386], "isController": false}, {"data": ["2.2 Session register", 1621, 0, 0.0, 124.6372609500309, 65, 668, 90.0, 234.39999999999986, 286.89999999999986, 444.89999999999986, 0.45435676564132277, 18.593084235775283, 5.093874244747498], "isController": false}, {"data": ["7.6 Needs triage search", 171, 0, 0.0, 189.47368421052624, 142, 448, 171.0, 250.0, 308.0, 390.4000000000001, 0.05377744064668788, 3.7880009925829587, 0.6221063176856706], "isController": false}, {"data": ["7.3 Last name search", 163, 0, 0.0, 2724.7607361963182, 392, 14311, 1257.0, 6759.399999999997, 8594.999999999993, 13659.479999999985, 0.04570804282086485, 6.214786579894294, 0.5191222392552449], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 1, 7.6923076923076925, 0.003587830080367394], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 12, 92.3076923076923, 0.04305396096440873], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 27872, 13, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 12, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1559, 12, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 141, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
