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

    var data = {"OkPercent": 99.97441146366428, "KoPercent": 0.0255885363357216};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8013570235135906, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.39951573849878935, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9896969696969697, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5384615384615384, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9903672486453944, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4230769230769231, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4226932668329177, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3269230769230769, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9711255156157925, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.548030739673391, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9800117577895355, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9719929245283019, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.42718446601941745, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9025194961007799, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4807692307692308, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.47506234413965087, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9818796068796068, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.38461538461538464, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4658018867924528, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4339853300733496, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5740740740740741, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.8959832134292566, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9849230769230769, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9840649428743236, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8461538461538461, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 19540, 5, 0.0255885363357216, 309.2636642784025, 2, 23780, 153.0, 686.0, 907.9500000000007, 1710.1800000000003, 5.201550775547494, 2217.1919069121564, 25.12016591564397], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 26, 0, 0.0, 125.07692307692308, 99, 213, 111.0, 176.4, 202.14999999999995, 213.0, 0.007639917747470158, 3.263147641887965, 0.033469118332188325], "isController": false}, {"data": ["2.0 Register attendance", 1652, 5, 0.3026634382566586, 1228.5895883777223, 421, 4217, 1176.0, 1791.2000000000003, 2099.4499999999994, 3085.29, 0.4642422467751041, 915.2514623951309, 9.302290299658956], "isController": true}, {"data": ["2.5 Select patient", 1650, 0, 0.0, 138.90181818181804, 77, 2504, 101.0, 220.9000000000001, 309.4499999999998, 685.3900000000001, 0.46409468206560944, 195.69095361155667, 1.9305967959641481], "isController": false}, {"data": ["7.1 Full name search", 26, 0, 0.0, 1268.3076923076924, 319, 5605, 706.5, 5416.0, 5553.55, 5605.0, 0.0076231333951589, 3.2657971320929224, 0.032988720364702434], "isController": false}, {"data": ["2.3 Search by first/last name", 1661, 0, 0.0, 131.6851294400964, 77, 2064, 99.0, 196.0, 299.4999999999993, 601.2799999999993, 0.46475552628177114, 197.9795708874767, 2.009441151065972], "isController": false}, {"data": ["4.0 Vaccination for flu", 403, 0, 0.0, 1212.8808933002479, 232, 4105, 1106.0, 1741.8000000000002, 2055.3999999999974, 3512.4799999999886, 0.11490916473298018, 141.83769889550337, 1.9370335624400148], "isController": true}, {"data": ["4.0 Vaccination for hpv", 401, 0, 0.0, 1212.2394014962592, 320, 3610, 1108.0, 1675.4, 1925.1, 3365.98, 0.11510422960681717, 142.17049511494133, 1.94640219583205], "isController": true}, {"data": ["7.6 First name search", 26, 0, 0.0, 1873.576923076923, 618, 5960, 1234.5, 4793.6, 5755.599999999999, 5960.0, 0.007640840527723467, 3.9312870690970025, 0.03300880990749587], "isController": false}, {"data": ["1.2 Sign-in page", 1697, 0, 0.0, 189.32410135533303, 18, 5169, 121.0, 319.0, 502.0, 1177.5599999999986, 0.47195116626447453, 197.7275753733928, 2.3476857871433494], "isController": false}, {"data": ["2.4 Patient attending session", 1041, 5, 0.4803073967339097, 716.5965417867438, 393, 3339, 604.0, 1051.6000000000001, 1298.8, 2055.4599999999937, 0.2925449924924693, 124.9770968960618, 1.4926876727237905], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 10.112147177419354, 19.027217741935484], "isController": false}, {"data": ["1.1 Homepage", 1701, 0, 0.0, 183.16166960611412, 36, 5095, 125.0, 303.79999999999995, 430.7999999999997, 848.2800000000007, 0.47265650181949137, 197.81986884615685, 2.3426759138894044], "isController": false}, {"data": ["1.3 Sign-in", 1696, 0, 0.0, 202.06308962264146, 88, 4933, 130.0, 358.0, 504.2999999999997, 978.6499999999985, 0.4723997125492315, 198.101831767488, 2.4643793430099605], "isController": false}, {"data": ["Run some searches", 26, 0, 0.0, 12878.230769230768, 6804, 35247, 8842.5, 24165.100000000002, 32369.649999999987, 35247.0, 0.007640618231808128, 30.43112856467901, 0.26620712878497127], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 412, 0, 0.0, 1202.2378640776692, 231, 3685, 1086.0, 1681.1999999999998, 2012.5499999999995, 2855.7500000000005, 0.11902079397269455, 147.34827274954645, 2.008292523753604], "isController": true}, {"data": ["2.1 Open session", 1667, 0, 0.0, 352.36592681463713, 108, 3644, 268.0, 628.4000000000001, 814.0, 1391.479999999999, 0.46531946400333846, 195.98706504092132, 1.9392319943419163], "isController": false}, {"data": ["7.7 Partial name search", 26, 0, 0.0, 1760.6923076923078, 264, 7899, 792.5, 5204.1, 7158.399999999997, 7899.0, 0.007672932402941095, 3.94818022390207, 0.03313995530147985], "isController": false}, {"data": ["4.3 Vaccination confirm", 1604, 0, 0.0, 858.304862842893, 536, 3618, 741.0, 1249.0, 1503.0, 2468.4500000000035, 0.46230632636232655, 193.6669007913573, 2.7899484933036196], "isController": false}, {"data": ["4.1 Vaccination questions", 1628, 0, 0.0, 182.8851351351351, 98, 2228, 132.0, 302.0, 417.7499999999998, 902.7800000000007, 0.46239267760863456, 189.4071062953925, 2.6422611481227225], "isController": false}, {"data": ["7.7 Last name search", 26, 0, 0.0, 2184.038461538461, 437, 11291, 1043.5, 6490.500000000001, 9910.949999999993, 11291.0, 0.007647234260080084, 3.9515856563216745, 0.03305797346233237], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1696, 0, 0.0, 992.3071933962269, 340, 15197, 855.0, 1364.3, 1673.199999999999, 2521.24, 0.4724214244230177, 815.8096043601141, 9.08825878208378], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 409, 0, 0.0, 1182.951100244499, 231, 3893, 1074.0, 1612.0, 1976.5, 3191.2999999999975, 0.11753903718573035, 145.04085936411093, 1.9817146891645674], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 1261.6666666666665, 269, 5054, 624.0, 4611.799999999999, 5033.599999999999, 5054.0, 0.0076508102208023825, 3.8996443688230333, 0.03182137118529185], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 26, 0, 0.0, 1858.7692307692307, 1626, 3575, 1783.0, 2106.1, 3101.7999999999984, 3575.0, 0.007638005540491711, 3.948073129496508, 0.03364721603878344], "isController": false}, {"data": ["7.2 No Consent search", 26, 0, 0.0, 3233.2692307692305, 2006, 23780, 2181.0, 3841.400000000003, 17778.549999999974, 23780.0, 0.007624172850555069, 4.208521363427165, 0.03353416140769795], "isController": false}, {"data": ["1.4 Open Sessions list", 1668, 0, 0.0, 424.7254196642684, 258, 2783, 355.0, 628.2000000000003, 757.55, 1248.4399999999987, 0.4649901189599721, 222.2284954179099, 1.9338756408946545], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1625, 0, 0.0, 172.32615384615391, 93, 1731, 123.0, 304.2000000000003, 422.0, 825.5400000000002, 0.4628284658019607, 190.80304515986452, 2.4084783966803096], "isController": false}, {"data": ["2.2 Session register", 1663, 0, 0.0, 152.8917618761275, 76, 2108, 98.0, 299.2000000000003, 403.79999999999995, 803.0399999999936, 0.46463883341286866, 201.60707581877926, 1.9404743289663897], "isController": false}, {"data": ["7.3 Due vaccination", 26, 0, 0.0, 574.4999999999999, 358, 1773, 413.5, 1207.6, 1580.499999999999, 1773.0, 0.007639080478006647, 3.9156906800243334, 0.03336100985044737], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 100.0, 0.0255885363357216], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 19540, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1041, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
