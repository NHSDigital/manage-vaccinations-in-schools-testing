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

    var data = {"OkPercent": 99.81742025561164, "KoPercent": 0.18257974438835786};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.60630460853178, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9629629629629629, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.04903846153846154, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9098202824133504, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9206500956022945, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.04396984924623116, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.034974093264248704, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.8530142945929149, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.2756892230576441, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.8696461824953445, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.838107098381071, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.050666666666666665, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6133333333333333, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.19418758256274768, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8471316818774446, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.22415940224159403, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.04946524064171123, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.03571428571428571, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.6467977171845276, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.8529028049575995, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8893129770992366, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8703703703703703, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 18622, 34, 0.18257974438835786, 842.0540758242959, 4, 21646, 329.0, 1916.7000000000007, 2953.0, 8526.42000000002, 4.963608555681068, 2033.8399522131565, 24.013698284860272], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 158.29629629629625, 62, 864, 115.0, 291.1999999999997, 769.5999999999995, 864.0, 0.007958005311231694, 3.216594488141835, 0.034936875241319144], "isController": false}, {"data": ["2.0 Register attendance", 1560, 34, 2.1794871794871793, 3681.5602564102483, 551, 25934, 2833.5, 6574.600000000001, 10193.75, 16383.499999999916, 0.4380383519424755, 853.5215685604958, 9.085435710483466], "isController": true}, {"data": ["2.5 Select patient", 1558, 0, 0.0, 411.21181001283645, 62, 16736, 135.0, 806.1000000000001, 1355.1, 6990.030000000032, 0.43884332391989056, 178.48243084996037, 1.8279803069586522], "isController": false}, {"data": ["2.3 Search by first/last name", 1569, 0, 0.0, 353.8655194391332, 62, 15053, 131.0, 681.0, 1190.5, 4415.399999999967, 0.43896964954330653, 178.59704242537447, 1.9004247954622457], "isController": false}, {"data": ["4.0 Vaccination for flu", 398, 0, 0.0, 3631.0452261306555, 643, 18535, 2603.5, 7153.0, 9870.449999999983, 15003.619999999995, 0.11390952664295174, 135.67249438528708, 1.924079401111362], "isController": true}, {"data": ["4.0 Vaccination for hpv", 386, 0, 0.0, 3826.3264248704663, 411, 22961, 2805.5, 7461.600000000001, 10870.549999999976, 17260.039999999994, 0.11059367026010142, 131.15359410670757, 1.8652620357286318], "isController": true}, {"data": ["1.2 Sign-in page", 1609, 0, 0.0, 529.9676817899309, 14, 17604, 177.0, 1143.0, 1876.0, 7657.800000000024, 0.44738909949944694, 180.68727974854244, 2.227137300888911], "isController": false}, {"data": ["7.1 Name search", 27, 0, 0.0, 7761.925925925925, 5605, 14886, 6689.0, 13124.6, 14383.999999999996, 14886.0, 0.007937144867886223, 3.208380097263831, 0.03441898317384082], "isController": false}, {"data": ["2.4 Patient attending session", 1197, 34, 2.8404344193817876, 1967.0242272347539, 105, 18611, 1363.0, 3402.2000000000007, 4839.4, 13043.619999999999, 0.33581712695402366, 136.89709887589285, 1.7091317728030209], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 22.0, 22, 22, 22.0, 22.0, 22.0, 22.0, 45.45454545454545, 14.24893465909091, 26.811079545454547], "isController": false}, {"data": ["1.1 Homepage", 1611, 0, 0.0, 457.2507759155807, 30, 18117, 187.0, 983.1999999999994, 1694.3999999999992, 3819.799999999984, 0.44769275660353763, 180.7192872864532, 2.2202935248162405], "isController": false}, {"data": ["1.3 Sign-in", 1606, 0, 0.0, 598.8088418430897, 73, 14810, 200.0, 1336.6, 2195.649999999997, 7806.590000000004, 0.44744511901733697, 180.97157082751855, 2.3380445675781436], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 13060.629629629626, 10311, 22220, 11580.0, 18691.6, 21335.999999999996, 22220.0, 0.007987270066462961, 17.896306835620354, 0.17507715804573984], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 375, 0, 0.0, 3820.5893333333343, 303, 22499, 2711.0, 7145.800000000001, 11721.599999999999, 16852.080000000016, 0.10836321268317717, 129.5452074752773, 1.8332171544239355], "isController": true}, {"data": ["2.1 Open session", 1575, 0, 0.0, 994.3136507936512, 222, 18852, 620.0, 2046.6000000000017, 2729.7999999999993, 7427.320000000002, 0.4396025211693036, 177.21024057736417, 1.8334099054345199], "isController": false}, {"data": ["4.3 Vaccination confirm", 1514, 0, 0.0, 2469.392338177017, 892, 17817, 1790.5, 4441.5, 6374.5, 12061.949999999997, 0.4379246191154964, 176.90996312585764, 2.6460554826665446], "isController": false}, {"data": ["4.1 Vaccination questions", 1534, 0, 0.0, 616.1134289439373, 79, 21646, 208.0, 1167.5, 1935.0, 8502.65000000003, 0.4375364019447837, 172.73236011358333, 2.502835924526682], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1606, 0, 0.0, 2384.633250311329, 510, 21435, 1613.5, 4452.9, 7130.199999999991, 13576.540000000005, 0.4473003086817759, 744.144497600426, 8.61131128280562], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 374, 0, 0.0, 3411.481283422459, 327, 16984, 2571.0, 6440.0, 9119.0, 13968.25, 0.10783750905734159, 128.58183867674438, 1.8244597501182898], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 2460.178571428571, 73, 12102, 1852.5, 4490.700000000001, 8849.84999999998, 12102.0, 0.007984760514218576, 3.9192023999552283, 0.033262409173349154], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 1958.888888888889, 1591, 3762, 1713.0, 2821.5999999999995, 3641.1999999999994, 3762.0, 0.00795766287567537, 3.9524083590385493, 0.035106337309561336], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 2679.777777777778, 1824, 12481, 2059.0, 3925.399999999999, 9512.199999999984, 12481.0, 0.007950902294895434, 4.224473591372505, 0.03502216019536839], "isController": false}, {"data": ["1.4 Open Sessions list", 1577, 0, 0.0, 821.1033608116667, 389, 17123, 561.0, 1393.2, 1931.1, 4307.42, 0.4395306693185296, 202.15983670535041, 1.8304144501421158], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.533203125, 153.564453125], "isController": false}, {"data": ["4.2 Vaccination batch", 1533, 0, 0.0, 619.0234833659488, 90, 15377, 209.0, 1113.2000000000016, 2017.3, 9318.400000000016, 0.43824053144597364, 174.16015405571528, 2.283354518919527], "isController": false}, {"data": ["2.2 Session register", 1572, 0, 0.0, 422.39694656488484, 59, 16398, 140.0, 826.7, 1471.35, 5529.779999999996, 0.43921361763381206, 184.34246999929314, 1.835635968466027], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 501.7407407407408, 278, 1953, 349.0, 1014.9999999999997, 1729.7999999999988, 1953.0, 0.007957543264720644, 3.2163164930104773, 0.03482605224878699], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 34, 100.0, 0.18257974438835786], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 18622, 34, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 34, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1197, 34, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
