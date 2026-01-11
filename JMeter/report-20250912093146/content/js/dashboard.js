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

    var data = {"OkPercent": 74.23956931359353, "KoPercent": 25.760430686406462};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4498327759197324, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.3181818181818182, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.05154639175257732, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.8095238095238095, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.7112676056338029, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.14912280701754385, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0020408163265306124, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.2857142857142857, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [0.5, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.5, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.25, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.18867924528301888, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.2857142857142857, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.02388535031847134, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3715, 957, 25.760430686406462, 15291.363660834433, 0, 87630, 2.0, 53455.60000000001, 60122.0, 60374.84, 2.392232039424499, 18.505475244221778, 0.8819525702569251], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 980, 938, 95.71428571428571, 56015.31428571429, 121, 144492, 52054.5, 86461.7, 90304.75, 120778.67999999988, 0.651309064760059, 16.547860265918526, 0.6923812821002324], "isController": true}, {"data": ["2.5 Select patient", 11, 0, 0.0, 1419.4545454545455, 852, 2934, 1176.0, 2704.2000000000007, 2934.0, 2934.0, 0.049170801484064185, 1.1284140181484958, 0.03419343821241786], "isController": false}, {"data": ["Choose session", 980, 0, 0.0, 0.4051020408163264, 0, 44, 0.0, 1.0, 1.0, 1.0, 0.6721812968983634, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 3, 0, 0.0, 1148.6666666666667, 734, 1895, 817.0, 1895.0, 1895.0, 1895.0, 0.014696732916272713, 0.34484697333032865, 0.011022549687204534], "isController": false}, {"data": ["2.3 Search by first/last name", 97, 52, 53.608247422680414, 36768.278350515466, 282, 78273, 36274.0, 60170.2, 60360.4, 78273.0, 0.06567321819080439, 1.6946894348633388, 0.06314356157033467], "isController": false}, {"data": ["2.5 Select td_ipv", 3, 0, 0.0, 2412.3333333333335, 2002, 3065, 2170.0, 3065.0, 3065.0, 3065.0, 0.013556197215557092, 0.33308441472248207, 0.009452270324128676], "isController": false}, {"data": ["4.0 Vaccination for flu", 4, 0, 0.0, 5556.5, 3622, 8689, 4957.5, 8689.0, 8689.0, 8689.0, 0.03130159872915509, 1.42484938551049, 0.186036650259412], "isController": true}, {"data": ["4.0 Vaccination for hpv", 4, 0, 0.0, 8347.0, 4083, 16940, 6182.5, 16940.0, 16940.0, 16940.0, 0.025367833587011668, 1.1012587796486555, 0.15127800371004566], "isController": true}, {"data": ["1.2 Sign-in page", 63, 6, 9.523809523809524, 5728.666666666668, 124, 44812, 141.0, 31254.200000000004, 42642.399999999994, 44812.0, 0.06746792863820805, 0.3652693074738401, 0.04065206247048278], "isController": false}, {"data": ["Get correct patient name", 24, 0, 0.0, 2.7499999999999996, 0, 42, 1.0, 2.0, 32.0, 42.0, 0.08483982947194275, 0.0, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 14, 3, 21.428571428571427, 23442.285714285714, 12292, 42961, 20554.0, 41438.5, 42961.0, 42961.0, 0.0445770434594333, 2.8995351848196065, 0.06634317796110972], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 161.0, 161, 161, 161.0, 161.0, 161.0, 161.0, 6.211180124223602, 29.61228649068323, 4.537072981366459], "isController": false}, {"data": ["1.1 Homepage", 71, 8, 11.267605633802816, 7379.704225352111, 367, 59579, 448.0, 37439.599999999984, 45313.79999999999, 59579.0, 0.0483275930135998, 0.2402041702543665, 0.026719633807873993], "isController": false}, {"data": ["1.3 Sign-in", 57, 4, 7.017543859649122, 9839.280701754386, 1101, 87630, 2702.0, 30942.60000000001, 50522.89999999992, 87630.0, 0.06308987650986803, 0.8750964074881042, 0.13668068075913725], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 3, 0, 0.0, 27900.0, 7047, 53327, 23326.0, 53327.0, 53327.0, 53327.0, 0.011004126547455296, 0.5305729883081155, 0.06681639729481889], "isController": true}, {"data": ["2.1 Open session", 980, 666, 67.95918367346938, 38152.7010204082, 121, 84105, 36859.0, 60122.0, 60359.95, 60379.0, 0.6521972058008283, 3.3617213553573007, 0.45642365998430734], "isController": false}, {"data": ["4.3 Vaccination confirm", 14, 0, 0.0, 5312.642857142858, 1594, 18888, 3707.5, 15862.5, 18888.0, 18888.0, 0.03587931224484043, 0.7255825062404375, 0.08352902107781454], "isController": false}, {"data": ["4.1 Vaccination questions", 14, 0, 0.0, 1628.4999999999998, 880, 3386, 1284.0, 2930.5, 3386.0, 3386.0, 0.04092669736168969, 0.46826753544544325, 0.0848737941240956], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 71, 19, 26.760563380281692, 24404.084507042255, 2479, 102191, 13828.0, 59780.6, 73051.99999999985, 102191.0, 0.048327560118463786, 1.8217018748115394, 0.15817265305882824], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 3, 0, 0.0, 6774.0, 4795, 9626, 5901.0, 9626.0, 9626.0, 9626.0, 0.014088806443280814, 0.665054036443046, 0.08410632205837462], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 997.0, 997, 997, 997.0, 997.0, 997.0, 997.0, 1.0030090270812437, 26.056685682046137, 0.653327169007021], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 872.0, 872, 872, 872.0, 872.0, 872.0, 872.0, 1.146788990825688, 20.42381916571101, 0.7469807196100917], "isController": false}, {"data": ["2.5 Select hpv", 4, 0, 0.0, 833.5, 685, 1206, 721.5, 1206.0, 1206.0, 1206.0, 0.02817953179707919, 0.6314733117818623, 0.02102457255172705], "isController": false}, {"data": ["2.5 Select flu", 4, 0, 0.0, 1285.25, 677, 1920, 1272.0, 1920.0, 1920.0, 1920.0, 0.03308793117710315, 0.7644071444081396, 0.024686698651666804], "isController": false}, {"data": ["Debug Sampler", 992, 0, 0.0, 0.7096774193548391, 0, 13, 0.0, 2.0, 3.0, 4.0, 0.6642778556414399, 5.876952263106597, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 53, 1, 1.8867924528301887, 5414.735849056604, 851, 43782, 2307.0, 16029.200000000004, 21611.699999999993, 43782.0, 0.06431258342434171, 1.4461076382568863, 0.03843681743720422], "isController": false}, {"data": ["4.2 Vaccination batch", 14, 0, 0.0, 4461.428571428571, 921, 42923, 1283.0, 22869.5, 42923.0, 42923.0, 0.03644495120281355, 0.5172178192707886, 0.057598581152493486], "isController": false}, {"data": ["2.2 Session register", 314, 217, 69.10828025477707, 43291.84713375793, 263, 60402, 52117.0, 60343.0, 60362.0, 60382.0, 0.2122041728531392, 5.120629455696296, 0.1582898886401159], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 121.0, 121, 121, 121.0, 121.0, 121.0, 121.0, 8.264462809917356, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 708, 73.98119122257053, 19.057873485868104], "isController": false}, {"data": ["504/Gateway Time-out", 249, 26.018808777429467, 6.702557200538358], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3715, 957, "502/Bad Gateway", 708, "504/Gateway Time-out", 249, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 97, 52, "502/Bad Gateway", 32, "504/Gateway Time-out", 20, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.2 Sign-in page", 63, 6, "502/Bad Gateway", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 14, 3, "502/Bad Gateway", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 71, 8, "502/Bad Gateway", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 57, 4, "502/Bad Gateway", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 980, 666, "502/Bad Gateway", 561, "504/Gateway Time-out", 105, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.5 Open Sessions list", 53, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.2 Session register", 314, 217, "504/Gateway Time-out", 124, "502/Bad Gateway", 93, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
