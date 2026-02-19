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

    var data = {"OkPercent": 99.97657640775789, "KoPercent": 0.02342359224210625};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8479783448171424, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.4723049434187016, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9943215780035863, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8518518518518519, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9884066587395958, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.49017199017199015, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4786729857819905, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.42592592592592593, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9848749272833043, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.8978378378378379, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9877977919814062, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9801980198019802, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4877750611246944, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.941315945465323, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.48148148148148145, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.7139778325123153, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9915100060642814, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4737914967967385, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.48157248157248156, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5535714285714286, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7394908229721728, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9899696048632218, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9845788849347569, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21346, 5, 0.02342359224210625, 239.2375620725201, 0, 5933, 127.0, 539.0, 674.0, 1070.0, 5.727715882108763, 2396.460335331472, 43.52664215465463], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 117.11111111111111, 87, 296, 106.0, 144.0, 236.79999999999967, 296.0, 0.00790779163496228, 3.5871445227999206, 0.058790460893188], "isController": false}, {"data": ["2.0 Register attendance", 1679, 5, 0.29779630732578916, 994.2346634901725, 380, 6166, 940.0, 1369.0, 1617.0, 2180.200000000001, 0.46973707034025863, 970.2525897372836, 15.944627408486602], "isController": true}, {"data": ["2.5 Select patient", 1673, 0, 0.0, 126.53795576808136, 75, 1442, 100.0, 175.0, 282.0, 517.52, 0.47142762543342176, 211.74905297960294, 3.400169326841928], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 635.5185185185186, 195, 5392, 314.0, 1280.199999999999, 4214.799999999994, 5392.0, 0.00790109005779501, 3.628573322847319, 0.05832197856463531], "isController": false}, {"data": ["2.3 Search by first/last name", 1682, 0, 0.0, 143.10285374554107, 82, 2726, 101.0, 224.70000000000005, 335.6999999999998, 739.8500000000004, 0.47020094521012834, 212.85111881468757, 3.516578468609055], "isController": false}, {"data": ["4.0 Vaccination for flu", 407, 0, 0.0, 913.3931203931206, 225, 2319, 834.0, 1285.8, 1478.6, 1931.5600000000004, 0.11614057175404223, 152.85012248041662, 3.290090336034339], "isController": true}, {"data": ["4.0 Vaccination for hpv", 422, 0, 0.0, 887.2725118483414, 226, 2359, 799.0, 1211.6, 1498.6999999999998, 1961.389999999998, 0.12146796627795958, 160.22094935589956, 3.4625853073197117], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 1327.4444444444443, 368, 5933, 855.0, 2586.599999999999, 4984.199999999995, 5933.0, 0.00790913053463379, 4.391192583099331, 0.05832011147626558], "isController": false}, {"data": ["1.2 Sign-in page", 1719, 0, 0.0, 150.22803955788237, 20, 5296, 108.0, 219.0, 368.0, 807.3999999999994, 0.4781808764368376, 213.63044035062148, 4.058277451101207], "isController": false}, {"data": ["2.4 Patient attending session", 925, 5, 0.5405405405405406, 440.57189189189234, 194, 2717, 385.0, 595.0, 757.2999999999994, 1252.0, 0.2605892189873475, 118.38175959190178, 2.2855836911505025], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 1721, 0, 0.0, 150.68797210923893, 38, 5082, 113.0, 212.79999999999995, 321.7999999999997, 713.78, 0.4780732177049874, 213.35944277594143, 4.048855908687043], "isController": false}, {"data": ["1.3 Sign-in", 1717, 0, 0.0, 170.09551543389617, 76, 5026, 114.0, 313.0, 415.0999999999999, 803.4599999999998, 0.4789726274256881, 214.18995479355848, 4.227325559692905], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 6574.333333333333, 3640, 20006, 4915.0, 10621.6, 16457.99999999998, 20006.0, 0.007906927845183525, 31.96312407212568, 0.46865134643267237], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 409, 0, 0.0, 910.8190709046452, 221, 2264, 845.0, 1258.0, 1458.5, 1855.9999999999977, 0.1181041881073414, 156.10275779054498, 3.358284422245285], "isController": true}, {"data": ["2.1 Open session", 1687, 0, 0.0, 324.21813870776515, 125, 1597, 286.0, 524.4000000000001, 623.5999999999999, 982.519999999995, 0.4710552335297506, 210.55032072139025, 3.4003200761150705], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1229.2592592592594, 254, 5364, 761.0, 4109.599999999999, 5242.4, 5364.0, 0.0079238046940619, 4.399423729381232, 0.05842057726604673], "isController": false}, {"data": ["4.3 Vaccination confirm", 1624, 0, 0.0, 592.404556650247, 382, 2130, 519.0, 854.5, 1059.5, 1523.0, 0.46980572491833367, 209.77549659978467, 4.8428315405657285], "isController": false}, {"data": ["4.1 Vaccination questions", 1649, 0, 0.0, 164.0121285627654, 97, 1030, 132.0, 248.0, 365.0, 600.0, 0.47097451739392576, 206.31630437012012, 4.416545563375062], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1042.5925925925926, 340, 5272, 680.0, 2116.5999999999995, 4284.399999999994, 5272.0, 0.00791510783015234, 4.399231131555542, 0.05838594406569188], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 33.0, 33, 33, 33.0, 33.0, 33.0, 33.0, 30.303030303030305, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1717, 0, 0.0, 1011.1764705882343, 439, 15398, 922.0, 1340.0000000000002, 1516.1, 2203.0999999999967, 0.4788662945063968, 880.1930885027431, 15.742807326982009], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 407, 0, 0.0, 903.9459459459459, 260, 2305, 824.0, 1257.4, 1527.1999999999998, 1898.3600000000017, 0.11773070735038799, 155.2681561604907, 3.3448178475268744], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 1132.6785714285713, 289, 5061, 657.5, 4549.000000000001, 5008.799999999999, 5061.0, 0.007894453413420682, 4.343416921908913, 0.056942379688529984], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 1971.7407407407404, 1697, 3275, 1836.0, 2572.7999999999997, 3028.9999999999986, 3275.0, 0.007904388516504362, 4.395715135736648, 0.05895785275748985], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 129.4074074074074, 92, 293, 107.0, 243.79999999999998, 285.79999999999995, 293.0, 0.007907064464246598, 3.586815234489854, 0.05892519007338341], "isController": false}, {"data": ["Debug Sampler", 1681, 0, 0.0, 0.30636525877453874, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.4701578426998975, 2.6849284309845487, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1689, 0, 0.0, 549.0373001776188, 325, 1913, 525.0, 805.0, 901.0, 1181.2999999999988, 0.47112405625260284, 238.43424023261366, 3.397596157232284], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1645, 0, 0.0, 154.77629179331305, 92, 1034, 121.0, 228.0, 344.6999999999998, 702.8199999999988, 0.4709356819234559, 207.23653454517205, 4.175727656911046], "isController": false}, {"data": ["2.2 Session register", 1686, 0, 0.0, 157.7431791221823, 80, 2393, 104.0, 285.5999999999999, 378.0, 738.1299999999999, 0.4708622560334463, 217.77555362883012, 3.4030733467107366], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 121.25925925925927, 87, 250, 110.0, 170.4, 218.79999999999984, 250.0, 0.007908664879698955, 3.5873166695506447, 0.05868854070340837], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 100.0, 0.02342359224210625], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21346, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 925, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
