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

    var data = {"OkPercent": 99.93865609664024, "KoPercent": 0.0613439033597584};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8055417637398312, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9814814814814815, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.4036363636363636, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.979890310786106, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9830611010284331, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.42840095465393796, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4478908188585608, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.37037037037037035, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9740412979351032, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.8108974358974359, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9793875147232037, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9663120567375887, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4488778054862843, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9251659625829813, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.48148148148148145, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.6103125, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9677320221266134, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.25925925925925924, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.425531914893617, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.44611528822055135, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5357142857142857, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5168878166465621, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9719482120838471, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9704106280193237, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21192, 13, 0.0613439033597584, 284.3644299735746, 0, 11406, 137.0, 658.0, 829.0, 1326.9800000000032, 5.620611880730149, 2356.6979576236345, 42.81449908943873], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 183.55555555555557, 80, 1146, 101.0, 394.79999999999995, 857.9999999999984, 1146.0, 0.007922416653976128, 3.59468881554296, 0.05895191498381333], "isController": false}, {"data": ["2.0 Register attendance", 1650, 5, 0.30303030303030304, 1202.6703030303026, 385, 3949, 1132.0, 1783.7000000000003, 2104.699999999999, 2644.2300000000005, 0.4625936927452693, 981.3879249816715, 16.160369788899576], "isController": true}, {"data": ["2.5 Select patient", 1641, 0, 0.0, 155.30286410725148, 56, 2365, 107.0, 302.0, 449.59999999999945, 743.1599999999999, 0.4638997772941837, 208.4411609671448, 3.349206078712569], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 1346.2962962962965, 326, 8836, 699.0, 4013.7999999999993, 7202.799999999991, 8836.0, 0.007914305077114644, 3.6336292695660677, 0.058468188267541035], "isController": false}, {"data": ["2.3 Search by first/last name", 1653, 0, 0.0, 150.88263762855416, 62, 1504, 108.0, 253.8000000000004, 414.5999999999999, 750.6400000000012, 0.4638287902149803, 210.3155878404708, 3.4722268196967296], "isController": false}, {"data": ["4.0 Vaccination for flu", 419, 2, 0.477326968973747, 1035.0453460620533, 225, 3129, 928.0, 1565.0, 1785.0, 2207.2000000000016, 0.12074847918875466, 159.6779553721618, 3.4387444869781842], "isController": true}, {"data": ["4.0 Vaccination for hpv", 403, 3, 0.7444168734491315, 1039.4441687344915, 255, 3489, 909.0, 1539.4, 1862.9999999999993, 2942.3199999999947, 0.11563496652181211, 152.22200672800747, 3.2895305521641385], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 1584.2222222222222, 493, 11406, 981.0, 2538.3999999999996, 8102.799999999982, 11406.0, 0.007923920967399228, 4.40085880812783, 0.058481907157178895], "isController": false}, {"data": ["1.2 Sign-in page", 1695, 0, 0.0, 175.7203539823011, 14, 5013, 112.0, 344.0, 485.199999999998, 933.6799999999994, 0.4713966523328711, 210.64279371357455, 4.003191745994102], "isController": false}, {"data": ["2.4 Patient attending session", 1092, 5, 0.45787545787545786, 540.4340659340666, 161, 3147, 441.0, 854.7, 1071.35, 1702.189999999999, 0.30746168976665006, 139.85531302844979, 2.699677995822801], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 15.673828125, 29.4921875], "isController": false}, {"data": ["1.1 Homepage", 1698, 0, 0.0, 168.59776207302713, 26, 5911, 115.0, 266.10000000000014, 447.14999999999986, 837.1699999999998, 0.4717158037295552, 210.51828044153905, 3.9975097774941832], "isController": false}, {"data": ["1.3 Sign-in", 1692, 0, 0.0, 201.77836879432638, 55, 7992, 118.0, 369.70000000000005, 557.7499999999995, 1007.1399999999999, 0.47110657700420766, 210.72478736251736, 4.161650525947198], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 9141.555555555557, 4347, 22038, 8086.0, 20772.399999999998, 21906.8, 22038.0, 0.007900623037280407, 31.937962296178554, 0.46867571448333434], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 401, 1, 0.24937655860349128, 1052.8129675810474, 217, 2938, 955.0, 1536.6, 1786.6999999999994, 2376.2200000000007, 0.11604197883695262, 153.18639612716404, 3.295737567954009], "isController": true}, {"data": ["2.1 Open session", 1657, 0, 0.0, 352.7748943874478, 108, 1867, 302.0, 564.2, 713.1999999999998, 1113.0400000000009, 0.46383799205457, 207.4737775038154, 3.3507711131663926], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1406.8518518518517, 337, 5487, 814.0, 4555.4, 5314.999999999999, 5487.0, 0.007933182622451612, 4.4046164461376565, 0.05854251486223], "isController": false}, {"data": ["4.3 Vaccination confirm", 1600, 4, 0.25, 673.342499999998, 49, 2748, 574.5, 1003.9000000000001, 1258.7999999999993, 1773.5200000000004, 0.4631987171711528, 206.9346381240119, 4.776357651272016], "isController": false}, {"data": ["4.1 Vaccination questions", 1627, 0, 0.0, 195.92071296865393, 72, 1473, 128.0, 374.20000000000005, 568.5999999999999, 1006.44, 0.46475489677985127, 203.74052697245892, 4.362050672512762], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 2332.9259259259256, 538, 9346, 1406.0, 6255.2, 8375.599999999995, 9346.0, 0.007925944669860921, 4.402774542063869, 0.05850056969562024], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1692, 0, 0.0, 1219.1353427895983, 334, 15964, 1101.0, 1640.0, 1863.35, 2604.8399999999992, 0.47104296763751075, 865.0527630283957, 15.484570521893755], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 399, 2, 0.5012531328320802, 1041.3634085213043, 225, 3018, 939.0, 1604.0, 1849.0, 2296.0, 0.1147254912278129, 151.23231086216063, 3.258489686350858], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 1256.214285714286, 279, 5791, 623.5, 4332.800000000001, 5409.399999999998, 5791.0, 0.007925848030355998, 4.359092022457041, 0.05722273198674119], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 1993.1481481481485, 1732, 3744, 1843.0, 2471.0, 3261.9999999999973, 3744.0, 0.007920192619084497, 4.403030961921328, 0.05912872967737243], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 171.59259259259264, 83, 664, 106.0, 413.8, 568.3999999999995, 664.0, 0.007920815315923186, 3.594410870108897, 0.05907923226397437], "isController": false}, {"data": ["Debug Sampler", 1653, 0, 0.0, 0.3109497882637626, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.4638524786362681, 2.643005648571977, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1658, 0, 0.0, 686.5940892641745, 332, 2230, 635.0, 905.1000000000001, 1016.3499999999997, 1329.1000000000008, 0.4631002916582175, 234.42172430648776, 3.3430207780818098], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 286.1328125, 614.2578125], "isController": false}, {"data": ["4.2 Vaccination batch", 1622, 4, 0.2466091245376079, 181.95622688039435, 74, 1717, 126.0, 333.70000000000005, 501.09999999999945, 941.3899999999999, 0.46435529191829983, 204.42498865816853, 4.1213838658186415], "isController": false}, {"data": ["2.2 Session register", 1656, 0, 0.0, 186.92572463768124, 61, 1759, 111.0, 374.29999999999995, 541.1499999999999, 969.7400000000011, 0.4640420641801559, 216.7705172080339, 3.356319828733171], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 122.96296296296296, 93, 394, 111.0, 142.99999999999997, 309.59999999999957, 394.0, 0.007921979649901312, 3.594939523295608, 0.05884035485407567], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 4, 30.76923076923077, 0.01887504718761797], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 4, 30.76923076923077, 0.01887504718761797], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 38.46153846153846, 0.02359380898452246], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21192, 13, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "Test failed: text expected to contain /Check and confirm/", 4, "Test failed: text expected to contain /Vaccination outcome recorded for/", 4, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1092, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 1600, 4, "Test failed: text expected to contain /Vaccination outcome recorded for/", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1622, 4, "Test failed: text expected to contain /Check and confirm/", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
