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

    var data = {"OkPercent": 99.93134697240149, "KoPercent": 0.06865302759851709};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5053503041225501, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.17592592592592593, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4411764705882353, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8528301886792453, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8583333333333333, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6119133574007221, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3862928348909657, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.43727272727272726, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4734251968503937, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4856115107913669, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5072332730560579, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7633517495395948, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.48720292504570384, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7283, 5, 0.06865302759851709, 787.2224358094202, 0, 8022, 702.0, 1475.0, 1812.7999999999993, 2907.7199999999975, 6.06561322825045, 2047.2886134857038, 21.640487970901216], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 486, 0, 0.0, 1923.67695473251, 1004, 7551, 1684.0, 2967.3, 3588.5999999999985, 4779.259999999998, 0.4616669215650699, 180.65579883427912, 2.394822942186192], "isController": false}, {"data": ["4.1 Vaccination questions", 510, 0, 0.0, 1255.4784313725484, 548, 3858, 1164.5, 1552.8000000000004, 1779.6499999999999, 2427.8799999999974, 0.4599803561330263, 176.00768709757358, 2.284423772855838], "isController": false}, {"data": ["Get Next Patient from STS", 550, 0, 0.0, 0.6036363636363631, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.46434623005738473, 0.19531068614753883, 0.2964453280331729], "isController": false}, {"data": ["2.0 Register attendance", 535, 5, 0.9345794392523364, 3177.5121495327107, 1538, 9906, 3099.0, 4242.6, 4755.799999999999, 5835.92, 0.4603762349484938, 838.7294628702801, 8.105538582916772], "isController": true}, {"data": ["1.0 Login", 553, 0, 0.0, 3549.734177215187, 1998, 7637, 3407.0, 4556.6, 4980.9, 5711.200000000001, 0.46468284345566063, 748.825366799041, 7.665066067627739], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 127, 0, 0.0, 4061.3937007874015, 1774, 8352, 3835.0, 5479.0, 5754.4, 8039.519999999999, 0.11697263761324242, 133.90029120257543, 1.6881736288412157], "isController": true}, {"data": ["2.5 Select patient", 530, 0, 0.0, 486.741509433962, 301, 2234, 416.5, 736.6000000000005, 909.45, 1501.8499999999844, 0.4635140134279135, 182.68849787379344, 1.647537296206881], "isController": false}, {"data": ["2.3 Search by first/last name", 540, 0, 0.0, 491.69629629629617, 303, 2468, 442.5, 669.8000000000001, 871.1499999999975, 1585.330000000009, 0.4626813239540403, 182.69793248654798, 1.7107260401761617], "isController": false}, {"data": ["4.0 Vaccination for flu", 126, 0, 0.0, 3869.730158730159, 1643, 6571, 3732.0, 4972.7, 5490.749999999999, 6453.280000000002, 0.11548190783443928, 131.65900916408515, 1.6580529011392382], "isController": true}, {"data": ["4.0 Vaccination for hpv", 127, 0, 0.0, 4034.3700787401567, 2025, 10014, 3800.0, 5251.6, 5807.599999999998, 9105.679999999997, 0.11742862743502591, 134.0187259074829, 1.693737832383117], "isController": true}, {"data": ["1.2 Sign-in page", 554, 0, 0.0, 761.6245487364622, 173, 2500, 617.5, 1271.0, 1611.75, 2172.7500000000045, 0.46357892975189324, 180.23203788544413, 1.950030366145768], "isController": false}, {"data": ["2.4 Patient attending session", 321, 5, 1.557632398753894, 1291.3613707165107, 335, 8022, 1107.0, 1969.4000000000005, 2445.199999999998, 3311.3799999999956, 0.27695596917764786, 109.51203466301318, 1.209942459108012], "isController": false}, {"data": ["Debug Sampler", 535, 0, 0.0, 0.5476635514018692, 0, 3, 1.0, 1.0, 1.0, 1.0, 0.46198191103350966, 2.8873793544493607, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 550, 0, 0.0, 1051.9145454545449, 477, 2633, 933.5, 1593.3000000000002, 1798.8999999999999, 2195.86, 0.46401950569267564, 207.37956123264672, 1.646840818108572], "isController": false}, {"data": ["4.2 Vaccination batch", 508, 0, 0.0, 904.3779527559059, 527, 4051, 809.0, 1254.3000000000002, 1533.6999999999985, 2056.9099999999967, 0.4615316126441491, 177.81469533434014, 2.064135617952671], "isController": false}, {"data": ["1.1 Homepage", 556, 0, 0.0, 804.8021582733807, 483, 3215, 744.0, 1056.6, 1336.0499999999988, 2577.4699999999984, 0.4647069295659754, 180.4744313438869, 1.936803971301004], "isController": false}, {"data": ["1.3 Sign-in", 553, 0, 0.0, 942.2929475587703, 396, 5683, 870.0, 1359.6000000000006, 1655.199999999999, 2862.4200000000046, 0.4648343953916671, 181.21418094529915, 2.1345597464551123], "isController": false}, {"data": ["2.2 Session register", 543, 0, 0.0, 553.1381215469613, 296, 2092, 485.0, 828.6, 1056.1999999999998, 1652.6399999999853, 0.4620867599803932, 187.2737359509775, 1.648967246994734], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 127, 0, 0.0, 4047.1732283464567, 1863, 10120, 3829.0, 5086.6, 5945.8, 9980.279999999999, 0.11712787689583458, 134.22410941455658, 1.6902420503488473], "isController": true}, {"data": ["2.1 Open session", 547, 0, 0.0, 897.020109689214, 405, 5810, 770.0, 1316.0, 1587.8000000000002, 2839.5199999999977, 0.46297628579602296, 179.2199074076523, 1.6480950022894896], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 100.0, 0.06865302759851709], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7283, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 321, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
