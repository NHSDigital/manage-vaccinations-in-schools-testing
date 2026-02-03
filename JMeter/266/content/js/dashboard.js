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

    var data = {"OkPercent": 99.81587363116581, "KoPercent": 0.18412636883418937};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7394457547169812, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.433354797166774, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9449715370018975, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.19485749690210658, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.3466295609152752, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.3489583333333333, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9545454545454546, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9646840148698885, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.34538653366583544, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.33625, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9419035846724351, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5183717579250721, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.6679035250463822, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9360280076384468, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9571516646115906, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9424860853432282, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9607054455445545, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.3290155440414508, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6830550401978973, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20638, 38, 0.18412636883418937, 392.5751526310684, 0, 18338, 147.0, 945.0, 1360.0, 2726.9900000000016, 5.4426669964933065, 2132.875055622396, 41.13839031559385], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1553, 0, 0.0, 1082.3129426915623, 474, 18338, 756.0, 1990.2000000000003, 2771.499999999999, 5470.240000000003, 0.44836174738092355, 187.792628363489, 4.584572960877911], "isController": false}, {"data": ["4.1 Vaccination questions", 1581, 0, 0.0, 245.52308665401662, 72, 4224, 130.0, 488.5999999999999, 858.7999999999997, 1676.6800000000017, 0.45041669954813035, 184.5728083789258, 4.191464053342898], "isController": false}, {"data": ["2.0 Register attendance", 1614, 38, 2.354399008674102, 2087.102230483272, 407, 16336, 1700.0, 3734.0, 4807.75, 6697.899999999997, 0.45153837782459777, 934.5807951639092, 16.40026196709589], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1617, 0, 0.0, 1403.3778602350017, 590, 6881, 1131.0, 2383.2000000000007, 3022.3999999999996, 4601.859999999995, 0.45121253952295365, 780.1691528068621, 14.753331509700093], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 384, 0, 0.0, 1603.703125, 196, 18778, 1173.0, 3070.5, 3963.25, 5944.849999999988, 0.11076452327699149, 136.94179537709192, 3.123983159952481], "isController": true}, {"data": ["2.5 Select patient", 1606, 0, 0.0, 199.12764632627673, 59, 6763, 98.0, 355.29999999999995, 714.1499999999985, 2010.900000000002, 0.4526299887941666, 190.6820944219695, 3.2376773837127044], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.812686011904762, 14.694940476190474], "isController": false}, {"data": ["2.3 Search by first/last name", 1614, 0, 0.0, 181.06009913258993, 67, 3152, 106.0, 306.0, 613.25, 1383.2499999999995, 0.45185301730871413, 192.1876811528334, 3.3524704907119567], "isController": false}, {"data": ["4.0 Vaccination for flu", 401, 0, 0.0, 1553.2369077306732, 194, 11112, 1186.0, 2750.0, 3722.7999999999984, 5695.320000000002, 0.1146965789242605, 141.65030457966134, 3.231910683846889], "isController": true}, {"data": ["4.0 Vaccination for hpv", 400, 0, 0.0, 1588.5925000000009, 221, 8656, 1145.5, 2950.7000000000016, 3901.899999999999, 7371.770000000003, 0.1150734413086612, 142.1256857837695, 3.2511025676372918], "isController": true}, {"data": ["1.2 Sign-in page", 1618, 0, 0.0, 233.87700865265768, 15, 4794, 114.0, 516.4000000000005, 899.2999999999997, 1997.0799999999963, 0.4502644259935594, 187.7188482540183, 3.785021471132568], "isController": false}, {"data": ["Debug Sampler", 1614, 0, 0.0, 0.2639405204460968, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.45187123405642066, 2.6076484263318305, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1388, 37, 2.6657060518731988, 869.9927953890489, 107, 14752, 614.0, 1481.2000000000016, 2070.4999999999995, 4319.11, 0.3900492479327811, 166.17484047990388, 3.3812346429524873], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.775862068965516, 20.339439655172413], "isController": false}, {"data": ["1.4 Open Sessions list", 1617, 0, 0.0, 713.852813852814, 301, 4896, 556.0, 1278.2, 1556.8999999999965, 2263.1399999999985, 0.4512154354187095, 215.55218614898718, 3.2271181871910626], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 142.578125, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1571, 0, 0.0, 249.64863144493975, 70, 5809, 119.0, 528.9999999999998, 960.7999999999997, 2106.7199999999975, 0.4489829863741808, 185.25437532678802, 3.94905022173715], "isController": false}, {"data": ["1.1 Homepage", 1622, 0, 0.0, 209.51787916152898, 28, 4794, 116.5, 381.10000000000014, 664.1999999999989, 1762.809999999999, 0.4507610274572381, 187.93991624029175, 3.7810942084989296], "isController": false}, {"data": ["1.3 Sign-in", 1617, 0, 0.0, 246.1267779839206, 68, 4684, 124.0, 469.0, 823.6999999999994, 2150.439999999994, 0.4513202162987723, 188.42067789022173, 3.949685067995982], "isController": false}, {"data": ["2.2 Session register", 1616, 0, 0.0, 197.51485148514828, 66, 4108, 104.0, 393.0, 636.1499999999999, 1463.3499999999967, 0.4519535103167618, 195.9353120519095, 3.2402102580162317], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 386, 0, 0.0, 1516.5440414507766, 203, 8038, 1232.5, 2619.0000000000005, 3126.149999999999, 5963.939999999998, 0.1113069074586874, 137.95770223524312, 3.1391502465548924], "isController": true}, {"data": ["2.1 Open session", 1617, 1, 0.06184291898577613, 761.2424242424245, 114, 9057, 537.0, 1538.6000000000004, 2079.3999999999987, 4169.299999999999, 0.45116734318516893, 189.2915052571842, 3.2302093292136296], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 37, 97.36842105263158, 0.1792809380753949], "isController": false}, {"data": ["Assertion failed", 1, 2.6315789473684212, 0.0048454307587944565], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20638, 38, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 37, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1388, 37, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 37, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 1617, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
