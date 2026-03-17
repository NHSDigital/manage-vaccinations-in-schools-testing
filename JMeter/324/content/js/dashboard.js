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

    var data = {"OkPercent": 99.91982644784002, "KoPercent": 0.08017355215996981};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8544427422443508, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.4892373923739237, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9950586781964176, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.997239263803681, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.49387254901960786, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.49038461538461536, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9795550210463019, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9264202600958248, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.981426003594967, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9788902291917974, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4987146529562982, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9629516227801592, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.7447685478757133, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9909544603867748, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4810012062726176, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4961340206185567, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.047619047619047616, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7385321100917431, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9887570268582137, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.992953431372549, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21204, 17, 0.08017355215996981, 260.6065365025438, 0, 9846, 115.0, 520.0, 634.0, 1269.9700000000048, 5.271614701748777, 151.60925927399194, 40.21536805881689], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 21, 0, 0.0, 132.8571428571429, 79, 422, 104.0, 226.40000000000006, 404.09999999999974, 422.0, 0.0060599047556112555, 0.18359617689265975, 0.04503785240149697], "isController": false}, {"data": ["2.0 Register attendance", 1626, 10, 0.6150061500615006, 959.3603936039364, 357, 2930, 918.5, 1310.3, 1467.6499999999999, 1939.5200000000004, 0.4561282343096516, 67.48556013611403, 16.868499688322892], "isController": true}, {"data": ["2.5 Select patient", 1619, 0, 0.0, 115.48857319332933, 54, 1428, 97.0, 192.0, 265.0, 510.19999999999914, 0.45605441103769984, 11.485260944760093, 3.2888882269687594], "isController": false}, {"data": ["7.1 Full name search", 21, 0, 0.0, 6266.857142857142, 4974, 8374, 5800.0, 8053.0, 8343.3, 8374.0, 0.006050232487385985, 0.25879796312801057, 0.04464719320711588], "isController": false}, {"data": ["2.3 Search by first/last name", 1630, 0, 0.0, 110.44110429447856, 56, 1172, 90.0, 183.80000000000018, 264.4499999999998, 433.7600000000002, 0.45621574358548067, 13.23553259715716, 3.411579865498922], "isController": false}, {"data": ["4.0 Vaccination for flu", 408, 2, 0.49019607843137253, 825.5318627450981, 55, 2232, 775.0, 1134.1000000000004, 1350.6499999999999, 1969.3399999999976, 0.11660064536170921, 6.103776920942048, 3.2994924951552145], "isController": true}, {"data": ["4.0 Vaccination for hpv", 416, 0, 0.0, 818.4687500000009, 187, 3240, 761.5, 1133.0, 1337.1999999999994, 1689.5999999999997, 0.11959260319749222, 5.8505756296902725, 3.3968416143305284], "isController": true}, {"data": ["7.6 First name search", 21, 0, 0.0, 7438.7619047619055, 6273, 9378, 7135.0, 9312.8, 9373.1, 9378.0, 0.006050952477548085, 0.8088863410156899, 0.04460889128397754], "isController": false}, {"data": ["1.2 Sign-in page", 1663, 0, 0.0, 200.42934455802782, 11, 8709, 92.0, 217.60000000000014, 362.79999999999995, 6192.4799999999905, 0.4626221859468566, 9.789401423171752, 3.9222720073970865], "isController": false}, {"data": ["2.4 Patient attending session", 1461, 10, 0.6844626967830253, 374.67761806981514, 14, 1512, 340.0, 545.5999999999999, 629.7999999999997, 953.7599999999998, 0.4105980961288553, 12.390853587966216, 3.5998592187422713], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 15.673828125, 29.4921875], "isController": false}, {"data": ["1.1 Homepage", 1669, 0, 0.0, 195.054523666866, 27, 8613, 94.0, 193.0, 279.5, 6011.5999999999985, 0.46295050645786834, 17.96362011303246, 3.916958731821426], "isController": false}, {"data": ["1.3 Sign-in", 1658, 1, 0.06031363088057901, 213.24487334137555, 55, 8748, 95.0, 285.10000000000014, 381.04999999999995, 6070.390000000007, 0.46162562941039714, 9.973800977108741, 4.072522201203205], "isController": false}, {"data": ["Run some searches", 21, 0, 0.0, 30331.04761904762, 25746, 38607, 29509.0, 33161.2, 38068.29999999999, 38607.0, 0.00601685234386483, 4.0275946122274755, 0.3565108126418079], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 389, 0, 0.0, 816.6323907455007, 177, 1933, 760.0, 1156.0, 1317.5, 1629.8000000000004, 0.11245381154822592, 5.602974121458211, 3.1965213875080294], "isController": true}, {"data": ["2.1 Open session", 1633, 0, 0.0, 272.9467238211882, 104, 1296, 235.0, 457.0, 545.7999999999997, 823.8000000000025, 0.45619507605439585, 10.512992982438865, 3.2930288920870967], "isController": false}, {"data": ["7.7 Partial name search", 21, 0, 0.0, 6639.142857142857, 5872, 8809, 6432.0, 8469.8, 8780.1, 8809.0, 0.006056000703649605, 0.809066937011825, 0.0446401938028368], "isController": false}, {"data": ["4.3 Vaccination confirm", 1577, 2, 0.12682308180088775, 538.7381103360811, 15, 2949, 502.0, 768.4000000000001, 952.0999999999999, 1281.7200000000007, 0.4546234221871797, 9.614364166387993, 4.684223306459285], "isController": false}, {"data": ["4.1 Vaccination questions", 1603, 2, 0.12476606363069245, 146.35745477230196, 21, 1137, 112.0, 239.60000000000014, 340.5999999999999, 526.8000000000002, 0.45689991554619774, 6.437590244769949, 4.2831057528594725], "isController": false}, {"data": ["7.7 Last name search", 21, 0, 0.0, 7684.285714285715, 6270, 9846, 7501.0, 9470.2, 9812.8, 9846.0, 0.00605229180116204, 0.8112286021763753, 0.04462017230658604], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1658, 1, 0.06031363088057901, 1124.9734620024108, 272, 26070, 853.5, 1252.0, 1439.1, 18315.23, 0.4615463417024101, 75.10523306176425, 15.17090047094499], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 388, 0, 0.0, 824.2113402061851, 206, 2205, 766.0, 1145.0, 1307.3999999999996, 1768.9900000000002, 0.11176979110283657, 5.960356645466655, 3.177271630533289], "isController": true}, {"data": ["7.0 Open Children Search", 21, 0, 0.0, 6557.238095238095, 185, 9150, 6327.0, 8507.2, 9087.599999999999, 9150.0, 0.006061242797223143, 0.7701865407000908, 0.043704142458976934], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 21, 0, 0.0, 1960.9047619047622, 1713, 3088, 1878.0, 2586.8, 3049.0999999999995, 3088.0, 0.006055246337513087, 0.8138663320950835, 0.04515106370854427], "isController": false}, {"data": ["7.2 No Consent search", 21, 0, 0.0, 95.04761904761905, 77, 146, 89.0, 125.60000000000001, 144.09999999999997, 146.0, 0.006060345457006322, 0.18360952876773842, 0.045147657250813746], "isController": false}, {"data": ["Debug Sampler", 1630, 0, 0.0, 0.31901840490797473, 0, 18, 0.0, 1.0, 1.0, 1.0, 0.45623068366867686, 2.6206277841792356, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1635, 0, 0.0, 526.1363914373089, 318, 2029, 514.0, 754.0, 868.1999999999998, 1264.0, 0.4557965190527127, 37.483928588167494, 3.2866004256331043], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1601, 2, 0.12492192379762648, 144.18925671455386, 15, 1014, 105.0, 243.0, 353.6999999999996, 664.8000000000002, 0.4569118693774297, 7.384623376264784, 4.050080372948962], "isController": false}, {"data": ["2.2 Session register", 1632, 0, 0.0, 124.27022058823529, 55, 899, 91.0, 232.80000000000018, 327.0, 550.7300000000014, 0.4564119587763797, 17.311073828427276, 3.298604441168722], "isController": false}, {"data": ["7.3 Due vaccination", 21, 0, 0.0, 113.19047619047619, 75, 240, 102.0, 184.20000000000002, 234.89999999999992, 240.0, 0.006060887677609262, 0.18362595635756812, 0.04496229388291924], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 2, 11.764705882352942, 0.009432182607055273], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 2, 11.764705882352942, 0.009432182607055273], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, 58.8235294117647, 0.047160913035276364], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 2, 11.764705882352942, 0.009432182607055273], "isController": false}, {"data": ["Assertion failed", 1, 5.882352941176471, 0.0047160913035276366], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21204, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, "Test failed: text expected to contain /Check and confirm/", 2, "Test failed: text expected to contain /Which batch did you use?/", 2, "Test failed: text expected to contain /Vaccination outcome recorded for/", 2, "Assertion failed", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1461, 10, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.3 Sign-in", 1658, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 1577, 2, "Test failed: text expected to contain /Vaccination outcome recorded for/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 1603, 2, "Test failed: text expected to contain /Which batch did you use?/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1601, 2, "Test failed: text expected to contain /Check and confirm/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
