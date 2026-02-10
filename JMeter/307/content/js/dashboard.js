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

    var data = {"OkPercent": 99.99067033633438, "KoPercent": 0.009329663665624854};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8590404515522108, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.5249706227967098, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9938198940553267, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6481481481481481, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9961876832844575, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.49515738498789347, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4928400954653938, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.37037037037037035, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9859357060849598, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9176788124156545, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9873925501432664, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9833141542002302, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5059523809523809, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9499121265377856, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.37037037037037035, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.7838494231936854, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9925373134328358, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3148148148148148, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.48216340621403914, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.49761336515513127, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.48214285714285715, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7466315172817809, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9934171154997008, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9906268306971294, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21437, 2, 0.009329663665624854, 219.41591640621238, 0, 9054, 110.0, 504.0, 625.0, 1008.9900000000016, 5.605058436466635, 2342.743165597339, 42.538917375851106], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 113.51851851851852, 84, 283, 94.0, 155.39999999999992, 264.5999999999999, 283.0, 0.007892793645541069, 3.580117300068229, 0.05867724552537065], "isController": false}, {"data": ["2.0 Register attendance", 1702, 2, 0.11750881316098707, 847.4688601645115, 328, 3092, 811.0, 1205.7, 1405.0, 1815.5800000000004, 0.47605834875441655, 958.7674351650205, 15.683856924240013], "isController": true}, {"data": ["2.5 Select patient", 1699, 0, 0.0, 117.9476162448497, 69, 1010, 92.0, 173.0, 287.0, 548.0, 0.4781778917449159, 214.75703556646843, 3.4487922450571635], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 805.0, 300, 4985, 623.0, 1050.3999999999996, 3531.7999999999925, 4985.0, 0.00789012965236381, 3.653146866343688, 0.05823279825712881], "isController": false}, {"data": ["2.3 Search by first/last name", 1705, 0, 0.0, 112.43167155425206, 75, 1053, 90.0, 146.4000000000001, 234.39999999999964, 461.40000000000055, 0.47677637649953863, 215.79470794388442, 3.5656664208215654], "isController": false}, {"data": ["4.0 Vaccination for flu", 413, 0, 0.0, 790.4358353510895, 188, 2668, 722.0, 1080.0, 1249.6, 2006.1200000000047, 0.11779513742813569, 155.40897159711096, 3.346096675492508], "isController": true}, {"data": ["4.0 Vaccination for hpv", 419, 0, 0.0, 798.5155131264916, 188, 2172, 730.0, 1073.0, 1281.0, 1816.8000000000015, 0.12047534568373353, 158.63766076108647, 3.428197990106789], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 1526.8148148148146, 355, 4668, 1205.0, 3397.4, 4185.999999999997, 4668.0, 0.007886633441545733, 4.366539235161591, 0.05814908855345706], "isController": false}, {"data": ["1.2 Sign-in page", 1742, 0, 0.0, 135.89724454649854, 13, 5347, 96.0, 181.0, 309.39999999999964, 804.4199999999996, 0.4843136050141749, 216.2948464784778, 4.111578444885557], "isController": false}, {"data": ["2.4 Patient attending session", 741, 2, 0.2699055330634278, 415.18893387314466, 210, 2556, 367.0, 580.8000000000001, 713.0, 1012.0, 0.20799410318472372, 94.51024599021895, 1.8250189827951544], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 28.0, 28, 28, 28.0, 28.0, 28.0, 28.0, 35.714285714285715, 11.195591517857142, 21.065848214285715], "isController": false}, {"data": ["1.1 Homepage", 1745, 0, 0.0, 138.3524355300862, 27, 4908, 100.0, 197.0, 292.6999999999998, 781.7399999999989, 0.48476558181037305, 216.33635502215407, 4.106913835852124], "isController": false}, {"data": ["1.3 Sign-in", 1738, 0, 0.0, 154.10932105868832, 66, 5311, 101.0, 283.10000000000014, 349.0, 803.7599999999984, 0.4836943786252727, 216.23161736760258, 4.26907350975237], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 8695.777777777781, 4063, 20048, 7074.0, 15400.999999999998, 19089.999999999996, 20048.0, 0.007846720419607734, 31.73166739103521, 0.46503369467117595], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 420, 0, 0.0, 816.4785714285719, 186, 2739, 757.0, 1115.2000000000003, 1287.1999999999998, 1492.6500000000008, 0.12152521083900716, 160.23569207694325, 3.446895836058006], "isController": true}, {"data": ["2.1 Open session", 1707, 0, 0.0, 301.8383128295257, 122, 1537, 258.0, 500.20000000000005, 607.3999999999996, 891.960000000001, 0.47724449596187407, 213.29338550128355, 3.445237847546944], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1608.333333333333, 406, 5882, 931.0, 3644.5999999999995, 5197.599999999997, 5882.0, 0.0079079375483812, 4.390263658051555, 0.0582972995894316], "isController": false}, {"data": ["4.3 Vaccination confirm", 1647, 0, 0.0, 537.2890103217976, 347, 2532, 478.0, 761.4000000000001, 934.7999999999997, 1354.4799999999996, 0.474100906635225, 211.6778579084932, 4.887003015790554], "isController": false}, {"data": ["4.1 Vaccination questions", 1675, 0, 0.0, 140.59402985074598, 85, 1343, 112.0, 204.4000000000001, 306.39999999999964, 550.0800000000002, 0.47609410689293313, 208.55005848407515, 4.464422597685983], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 2420.9629629629626, 433, 9054, 1005.0, 7402.4, 8483.599999999997, 9054.0, 0.007891028981411367, 4.382455389839482, 0.05818720560251368], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 33.0, 33, 33, 33.0, 33.0, 33.0, 33.0, 30.303030303030305, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1738, 0, 0.0, 947.3319907940142, 250, 15566, 858.0, 1242.0, 1415.05, 2162.279999999995, 0.48372601513578145, 888.5589477392732, 15.899571167615933], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 419, 0, 0.0, 799.4988066825777, 184, 2279, 720.0, 1155.0, 1309.0, 1709.0000000000007, 0.12017507127328213, 158.38155692684524, 3.4117826423027724], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 1352.1428571428567, 347, 4792, 756.0, 3194.000000000001, 4291.599999999997, 4792.0, 0.00784817151618265, 4.315995885228199, 0.05660581297246693], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 1920.1481481481483, 1675, 2639, 1801.0, 2461.6, 2573.7999999999997, 2639.0, 0.007884005834164317, 4.3826785791196485, 0.05880325445190829], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 164.0740740740741, 83, 595, 103.0, 389.4, 522.9999999999997, 595.0, 0.00789019190700094, 3.57938464539432, 0.05879659824969243], "isController": false}, {"data": ["Debug Sampler", 1705, 0, 0.0, 0.3032258064516132, 0, 14, 0.0, 1.0, 1.0, 1.0, 0.47679464245015957, 2.7042928497512415, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1707, 0, 0.0, 528.0650263620386, 315, 1517, 505.0, 773.0, 875.1999999999998, 1235.1200000000008, 0.4771532483737796, 241.44251747727512, 3.440994408980572], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1671, 0, 0.0, 131.05924596050266, 81, 1228, 104.0, 188.79999999999995, 271.39999999999986, 555.0, 0.4756630461051566, 209.30143226998376, 4.2175693598773805], "isController": false}, {"data": ["2.2 Session register", 1707, 0, 0.0, 133.8910369068539, 72, 946, 91.0, 265.0, 339.7999999999997, 642.8800000000028, 0.4771384439416834, 220.71150155347766, 3.44865985014862], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 136.9259259259259, 83, 759, 94.0, 203.99999999999997, 548.1999999999989, 759.0, 0.007891670166768528, 3.5796074123352355, 0.05856099934046097], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, 100.0, 0.009329663665624854], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21437, 2, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 741, 2, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
